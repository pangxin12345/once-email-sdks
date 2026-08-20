import io
import json
import tempfile
import unittest
from pathlib import Path
from urllib.error import URLError

from once_email import OnceEmailClient, OnceEmailError
from once_email.client import MAX_ATTACHMENT_BYTES

INBOX_ID = "123e4567-e89b-42d3-a456-426614174000"
ADDRESS = "private@example.test"
API_KEY = "oe_live_0000000000000000"

class FakeResponse:
    def __init__(self, status=200, body=b"", headers=None):
        self.status = status
        self.body = body
        self.headers = headers or {"Cache-Control": "no-store"}
        self.closed = False
    def read(self, amount=-1): return self.body if amount < 0 else self.body[:amount]
    def close(self): self.closed = True

def inbox():
    return {"id": INBOX_ID, "address": ADDRESS, "expiresAt": "2026-08-15T01:00:00Z", "serverTime": "2026-08-15T00:00:00Z"}

def summary():
    return {"uid": 7, "subject": "private", "from": "sender@example.test", "receivedAt": "2026-08-15T00:00:01Z", "attachmentsCount": 0}

def message():
    return {**summary(), "bodyPreview": "private body", "bodyHtml": "", "attachments": []}

class ClientTests(unittest.TestCase):
    def test_all_operations_use_contract_paths_header_timeout_and_no_store(self):
        requests = []
        responses = [
            FakeResponse(201, json.dumps(inbox()).encode()),
            FakeResponse(200, json.dumps([summary()]).encode(), {"Cache-Control": "private, no-store", "X-Next-Cursor": "next"}),
            FakeResponse(200, json.dumps(message()).encode()),
            FakeResponse(200, b"attachment", {"Cache-Control": "no-store", "Content-Length": "10"}),
            FakeResponse(204),
        ]
        all_responses = responses.copy()
        def transport(request, timeout):
            requests.append((request, timeout)); return responses.pop(0)
        client = OnceEmailClient(API_KEY, timeout_seconds=7, transport=transport)
        self.assertEqual(client.create_inbox("stable-key-123")["id"], INBOX_ID)
        page = client.list_messages(INBOX_ID, since="2026-08-15T00:00:00Z", cursor="opaque cursor", page_size=25)
        self.assertEqual(page.next_cursor, "next")
        self.assertEqual(client.get_message(INBOX_ID, 7)["uid"], 7)
        self.assertEqual(client.download_attachment(INBOX_ID, 7, "cid/with space"), b"attachment")
        self.assertIsNone(client.delete_inbox(INBOX_ID))
        self.assertEqual([item[0].get_method() for item in requests], ["POST", "GET", "GET", "GET", "DELETE"])
        self.assertTrue(all(item[1] == 7 for item in requests))
        self.assertTrue(all(API_KEY not in item[0].full_url for item in requests))
        self.assertTrue(all(item[0].get_header("Authorization") == f"Bearer {API_KEY}" for item in requests))
        self.assertIn("cursor=opaque+cursor", requests[1][0].full_url)
        self.assertIn("cid%2Fwith%20space", requests[3][0].full_url)
        self.assertTrue(all(response.closed for response in all_responses))

    def test_stable_errors_retry_after_and_no_sensitive_rendering(self):
        private = json.dumps({"code": "rate_limited", "retryable": True, "detail": ADDRESS}).encode()
        client = OnceEmailClient(API_KEY, transport=lambda _request, _timeout: FakeResponse(429, private, {"Retry-After": "12", "Cache-Control": "no-store"}))
        with self.assertRaises(OnceEmailError) as caught: client.create_inbox()
        error = caught.exception
        self.assertEqual((error.code, error.status, error.retryable, error.retry_after_seconds), ("rate_limited", 429, True, 12))
        rendered = f"{error!s}{error!r}{error.args}"
        for forbidden in (ADDRESS, API_KEY, "detail", "v1/inboxes"): self.assertNotIn(forbidden, rendered)

    def test_network_redirect_malformed_no_store_and_schema_fail_closed(self):
        cases = [
            (lambda _r, _t: (_ for _ in ()).throw(URLError("private host")), "network_unavailable"),
            (lambda _r, _t: FakeResponse(302, b"private redirect", {"Location": "https://private.example"}), "malformed_response"),
            (lambda _r, _t: FakeResponse(201, b"not-json"), "malformed_response"),
            (lambda _r, _t: FakeResponse(201, json.dumps(inbox()).encode(), {"Cache-Control": "private"}), "malformed_response"),
            (lambda _r, _t: FakeResponse(201, json.dumps({**inbox(), "extra": ADDRESS}).encode()), "malformed_response"),
            (lambda _r, _t: FakeResponse(503, json.dumps({"code": ADDRESS, "retryable": True}).encode()), "malformed_response"),
            (lambda _r, _t: FakeResponse(503, json.dumps({"code": "service_unavailable", "retryable": True}).encode(), {"Retry-After": "1"}), "malformed_response"),
        ]
        for transport, code in cases:
            with self.subTest(code=code):
                with self.assertRaises(OnceEmailError) as caught: OnceEmailClient(API_KEY, transport=transport).create_inbox()
                self.assertEqual(caught.exception.code, code)
                self.assertNotIn("private", str(caught.exception))

    def test_response_and_attachment_limits(self):
        oversized_json = b"{" + b"x" * (3 * 1024 * 1024 + 1)
        with self.assertRaises(OnceEmailError) as caught:
            OnceEmailClient(API_KEY, transport=lambda _r, _t: FakeResponse(201, oversized_json)).create_inbox()
        self.assertEqual(caught.exception.code, "malformed_response")
        client = OnceEmailClient(API_KEY, transport=lambda _r, _t: FakeResponse(200, b"", {"Cache-Control": "no-store", "Content-Length": str(MAX_ATTACHMENT_BYTES + 1)}))
        with self.assertRaises(OnceEmailError) as caught: client.download_attachment(INBOX_ID, 1, "cid")
        self.assertEqual(caught.exception.code, "response_too_large")

    def test_inputs_fail_before_transport(self):
        called = False
        def transport(_r, _t):
            nonlocal called; called = True; return FakeResponse()
        client = OnceEmailClient(API_KEY, transport=transport)
        invalid_calls = [
            lambda: client.create_inbox("short"),
            lambda: client.list_messages("../private", since="now"),
            lambda: client.list_messages(INBOX_ID, since="x\nheader"),
            lambda: client.list_messages(INBOX_ID, since="now"),
            lambda: client.list_messages(INBOX_ID, since="now", cursor="x\rheader"),
            lambda: client.list_messages(INBOX_ID, since="now", page_size=True),
            lambda: client.get_message(INBOX_ID, True),
            lambda: client.download_attachment(INBOX_ID, 1, "x\nheader"),
        ]
        for call in invalid_calls:
            with self.assertRaises(ValueError): call()
        self.assertFalse(called)

    def test_constructor_rejects_key_and_timeout_without_echo(self):
        for key in ("private", "oe_live_" + "x" * 181):
            with self.assertRaises(ValueError) as caught: OnceEmailClient(key)
            self.assertNotIn(key, str(caught.exception))
        for timeout in (0, 31, True):
            with self.assertRaises(ValueError): OnceEmailClient(API_KEY, timeout_seconds=timeout)

if __name__ == "__main__": unittest.main()
