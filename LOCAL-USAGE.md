# Local SDK usage

Each downloaded bundle is self-contained source for one language and is tied to Once Email Developer API contract `0.5.0-private-beta`.

1. Read the generated language README and install dependencies with that language's standard package manager.
2. Inject the API key through the process secret facility. Never put it in source, a URL, a command-line argument, a browser, or checked-in configuration.
3. Create one inbox with an idempotency key, trigger only an application you own or are authorized to test, list messages with `since` and cursor pagination, then read the uniquely matched message.
4. Delete the inbox in `finally`. Treat cleanup failure as a separate failure and retry the idempotent delete.
5. Handle 429 and 503 using `Retry-After`; do not convert network or dependency failures into an empty inbox result.

The SDK is receive-only. It does not send email, automate third-party registrations, open links, or expose message content to analytics or advertising.

## Runnable demo

Run `node demos/api/authorized-workflow.mjs` with Node.js 20+ on Windows, Linux, or macOS. Inject `ONCE_EMAIL_API_KEY` through the process secret facility. The demo prints only a redacted count and deletes the inbox in `finally`.
