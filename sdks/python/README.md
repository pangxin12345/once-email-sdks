# Once Email Python SDK

Official private candidate for the Once Email Developer API. It is generated and tested against the same versioned OpenAPI contract as the service; it is not yet published to PyPI.

Python 3.11 or newer is supported. The client covers inbox creation with idempotency, incremental message listing, detail and attachment reads, deletion, stable 400/401/403/404/413/429/503 errors, bounded timeouts, `Retry-After`, `no-store`, response limits, and cleanup in `finally`.

Use only for applications you own or are explicitly authorized to test. Keep the API key in a secrets manager, never in source, URLs, logs, exceptions, notebooks, or CI artifacts. Canonical documentation is prepared at `https://once-email.com/docs/developer-api` and `https://once-email.com/docs/sdk-cli`; source links will appear after the official repository is created and verified.
