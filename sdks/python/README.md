# Once Email Python SDK

SDK `0.1.0.dev2` · API contract `0.5.0-private-beta` · Python 3.11+ · MIT

This is a public-source prerelease candidate, not a PyPI release. API calls remain controlled. Use it only with local, test, or staging applications you own or are explicitly authorized to test.

## Install from the downloaded archive

Verify the archive against `SHA256SUMS`, extract it, enter this directory, then create an isolated environment:

```text
python -m venv .venv
.venv/bin/python -m pip install .
```

On Windows PowerShell, use `.venv\Scripts\python -m pip install .`.

## Configure safely

Provide `ONCE_EMAIL_API_KEY` through the process secret facility. Never put it in source, notebooks, URLs, command arguments, browser code, Git, logs, screenshots, or CI artifacts.

## First bounded workflow

```python
import os
import secrets
from datetime import datetime, timezone
from once_email import OnceEmailClient, OnceEmailError

client = OnceEmailClient(os.environ["ONCE_EMAIL_API_KEY"], timeout_seconds=10)
inbox = None
try:
    inbox = client.create_inbox("test-" + secrets.token_hex(8))
    # Trigger one uniquely marked email from your authorized test system here.
    page = client.list_messages(
        inbox["id"],
        since=datetime.now(timezone.utc).isoformat(),
        page_size=25,
    )
    print({"messageCount": len(page.items)})  # redacted metadata only
except OnceEmailError as error:
    # Branch on error.status and error.code; never print response content or keys.
    raise
finally:
    if inbox is not None:
        client.delete_inbox(inbox["id"])
```

For a real assertion, poll with bounded backoff and one fixed deadline, follow `next_cursor`, and read only a uniquely matched message. Keep addresses, bodies, OTPs, links, attachments, and keys out of logs and reports.

## Errors and cleanup

Distinguish 400, 401, 403, 404, 413, 429, and 503. Retry a retryable 429 or 503 only within the original deadline and honor a valid `Retry-After`. Timeout, ambiguity, extraction, assertion, and cleanup are different failures. A failed delete must fail the test separately.

## Verify locally

```text
python -m unittest discover -s tests -v
python -m build
```

Canonical documentation: <https://once-email.com/sdk> · API contract: <https://once-email.com/api> · Security: [SECURITY.md](SECURITY.md)
