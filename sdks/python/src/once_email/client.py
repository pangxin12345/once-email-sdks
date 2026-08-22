import json
import re
import socket
from dataclasses import dataclass
from datetime import datetime
from typing import Callable, Mapping, Protocol, cast
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlencode
from urllib.request import HTTPRedirectHandler, Request, build_opener

from .errors import OnceEmailError
from .generated_contract import ERROR_CODES, Inbox, Message, MessageSummary, OPERATIONS, SCHEMA_DEFINITIONS

BASE_URL = "https://api.once-email.com"
MAX_JSON_BYTES = 3 * 1024 * 1024
MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024
UUID = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$", re.I)
IDEMPOTENCY_KEY = re.compile(r"^[A-Za-z0-9._:-]{8,128}$")

class Response(Protocol):
    status: int
    headers: Mapping[str, str]
    def read(self, amount: int = -1) -> bytes: ...
    def close(self) -> None: ...

Transport = Callable[[Request, float], Response]

@dataclass(frozen=True)
class MessagePage:
    items: list[MessageSummary]
    next_cursor: str | None

class _NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None

def _default_transport(request: Request, timeout: float) -> Response:
    return cast(Response, build_opener(_NoRedirect()).open(request, timeout=timeout))

class OnceEmailClient:
    def __init__(self, api_key: str, *, timeout_seconds: float = 10.0, transport: Transport | None = None):
        if not isinstance(api_key, str) or not api_key.startswith("oe_live_") or len(api_key) > 180:
            raise ValueError("API key configuration is invalid")
        if not isinstance(timeout_seconds, (int, float)) or isinstance(timeout_seconds, bool) or not 0 < timeout_seconds <= 30:
            raise ValueError("Request timeout is invalid")
        self._api_key = api_key
        self._timeout = float(timeout_seconds)
        self._transport = transport or _default_transport

    def create_inbox(self, idempotency_key: str | None = None) -> Inbox:
        headers = {}
        if idempotency_key is not None:
            if not IDEMPOTENCY_KEY.fullmatch(idempotency_key): raise ValueError("Idempotency key is invalid")
            headers["Idempotency-Key"] = idempotency_key
        value = self._json("createInbox", headers=headers)
        if not _matches("Inbox", value): raise _malformed()
        return cast(Inbox, value)

    def list_messages(self, inbox_id: str, *, since: str, cursor: str | None = None, page_size: int = 50) -> MessagePage:
        inbox_id = _inbox_id(inbox_id)
        if not isinstance(since, str) or not 1 <= len(since) <= 40 or not _date_time(since):
            raise ValueError("Since value is invalid")
        if cursor is not None and (not isinstance(cursor, str) or not 1 <= len(cursor) <= 96 or any(char in cursor for char in "\r\n")):
            raise ValueError("Cursor is invalid")
        if not isinstance(page_size, int) or isinstance(page_size, bool) or not 1 <= page_size <= 100:
            raise ValueError("Page size is invalid")
        query = {"since": since, "pageSize": str(page_size)}
        if cursor is not None: query["cursor"] = cursor
        response, value = self._json_response("listMessages", path={"inboxId": inbox_id}, query=query)
        if not isinstance(value, list) or len(value) > 100 or not all(_matches("MessageSummary", item) for item in value): raise _malformed()
        next_cursor = response.headers.get("X-Next-Cursor")
        if next_cursor is not None and not 1 <= len(next_cursor) <= 96: raise _malformed()
        return MessagePage(cast(list[MessageSummary], value), next_cursor)

    def get_message(self, inbox_id: str, uid: int) -> Message:
        value = self._json("getMessage", path={"inboxId": _inbox_id(inbox_id), "uid": _uid(uid)})
        if not _matches("Message", value): raise _malformed()
        return cast(Message, value)

    def download_attachment(self, inbox_id: str, uid: int, cid: str) -> bytes:
        if not isinstance(cid, str) or len(cid) < 1 or any(char in cid for char in "\r\n"):
            raise ValueError("Attachment reference is invalid")
        response = self._request("downloadAttachment", path={"inboxId": _inbox_id(inbox_id), "uid": _uid(uid), "cid": cid})
        try:
            declared = response.headers.get("Content-Length")
            if declared is not None and not declared.isdigit(): raise _malformed()
            if declared is not None and int(declared) > MAX_ATTACHMENT_BYTES:
                raise OnceEmailError("response_too_large", 413, False)
            body = response.read(MAX_ATTACHMENT_BYTES + 1)
            if len(body) > MAX_ATTACHMENT_BYTES: raise OnceEmailError("response_too_large", 413, False)
            return body
        finally: response.close()

    def delete_inbox(self, inbox_id: str) -> None:
        self._request("deleteInbox", path={"inboxId": _inbox_id(inbox_id)}).close()

    def _json(self, operation: str, *, path: dict[str, object] | None = None, query: dict[str, str] | None = None,
              headers: dict[str, str] | None = None):
        return self._json_response(operation, path=path, query=query, headers=headers)[1]

    def _json_response(self, operation: str, *, path: dict[str, object] | None = None, query: dict[str, str] | None = None,
                       headers: dict[str, str] | None = None):
        response = self._request(operation, path=path, query=query, headers=headers)
        try:
            body = response.read(MAX_JSON_BYTES + 1)
            if len(body) > MAX_JSON_BYTES: raise _malformed()
            try: return response, json.loads(body)
            except (UnicodeDecodeError, json.JSONDecodeError): raise _malformed() from None
        finally: response.close()

    def _request(self, operation: str, *, path: dict[str, object] | None = None, query: dict[str, str] | None = None,
                 headers: dict[str, str] | None = None) -> Response:
        contract = OPERATIONS[operation]
        route = contract["path"]
        for name, value in (path or {}).items(): route = route.replace("{" + name + "}", quote(str(value), safe=""))
        if "{" in route: raise ValueError("Request path is incomplete")
        url = BASE_URL + route + (("?" + urlencode(query)) if query else "")
        request_headers = {"Authorization": f"Bearer {self._api_key}", "Accept": "application/json", "User-Agent": "once-email-python/0.1.0.dev2", **(headers or {})}
        request = Request(url, method=contract["method"], headers=request_headers)
        try:
            response = self._transport(request, self._timeout)
        except HTTPError as error:
            raise self._api_error(cast(Response, error)) from None
        except (URLError, TimeoutError, socket.timeout, OSError):
            raise OnceEmailError("network_unavailable", None, True) from None
        if response.status != contract["success"]:
            raise self._api_error(response)
        cache_control = response.headers.get("Cache-Control", "")
        if "no-store" not in {item.strip().lower() for item in cache_control.split(",")}:
            response.close()
            raise _malformed()
        return response

    def _api_error(self, response: Response) -> OnceEmailError:
        try:
            cache_control = response.headers.get("Cache-Control", "")
            if "no-store" not in {item.strip().lower() for item in cache_control.split(",")}:
                return OnceEmailError("malformed_response", response.status, False)
            try:
                raw = response.read(65537)
                if len(raw) > 65536: raise ValueError
                value = json.loads(raw)
                candidate = value.get("code") if isinstance(value, dict) else None
                code = candidate if isinstance(candidate, str) and candidate in ERROR_CODES else "malformed_response"
                declared_retryable = value.get("retryable") is True if isinstance(value, dict) else False
            except (ValueError, UnicodeDecodeError, json.JSONDecodeError):
                code, declared_retryable = "malformed_response", False
            retryable = declared_retryable and response.status in {409, 429, 503}
            return OnceEmailError(code, response.status, retryable, _retry_after(response.headers.get("Retry-After")))
        finally: response.close()

def _inbox_id(value: str) -> str:
    if not isinstance(value, str) or not UUID.fullmatch(value): raise ValueError("Inbox reference is invalid")
    return value

def _uid(value: int) -> int:
    if not isinstance(value, int) or isinstance(value, bool) or value < 1 or value > 9223372036854775807:
        raise ValueError("Message reference is invalid")
    return value

def _retry_after(value: str | None) -> int | None:
    if value is None or not value.isdigit(): return None
    seconds = int(value)
    return seconds if 1 <= seconds <= 300 else None

def _date_time(value: str) -> bool:
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
        return parsed.tzinfo is not None
    except ValueError:
        return False

def _malformed() -> OnceEmailError:
    return OnceEmailError("malformed_response", None, False)

def _matches(name: str, value: object) -> bool:
    definition = SCHEMA_DEFINITIONS[name]
    if not isinstance(value, dict) or set(value) != set(definition["required"]): return False
    return all(_matches_value(schema, value[field]) for field, schema in definition["properties"].items())

def _matches_value(schema: dict, value: object) -> bool:
    if "$ref" in schema: return _matches(schema["$ref"].rsplit("/", 1)[-1], value)
    kind = schema.get("type")
    if isinstance(kind, list):
        if value is None and "null" in kind: return True
        choices = [item for item in kind if item != "null"]
        return len(choices) == 1 and _matches_value({**schema, "type": choices[0]}, value)
    if kind == "string":
        return isinstance(value, str) and len(value) >= schema.get("minLength", 0) and len(value) <= schema.get("maxLength", len(value))
    if kind == "integer":
        return isinstance(value, int) and not isinstance(value, bool) and value >= schema.get("minimum", value) and value <= schema.get("maximum", value)
    if kind == "boolean": return isinstance(value, bool)
    if kind == "array":
        return isinstance(value, list) and len(value) >= schema.get("minItems", 0) and len(value) <= schema.get("maxItems", len(value)) and all(_matches_value(schema["items"], item) for item in value)
    return False
