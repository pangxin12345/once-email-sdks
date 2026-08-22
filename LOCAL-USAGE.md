# Local API, SDK, CLI, and Skill usage

Candidate `0.1.0-private.2` is tied to API contract `0.5.0-private-beta`. Source and documentation are public, but API calls require an active Developer entitlement and API key. Language-registry publication is not available.

## Choose one product

- Use the cross-platform API demo to understand create → list → read → delete.
- Use the SDK matching the runtime already owned by the authorized test service.
- Use the TypeScript CLI/Playwright fixture for deterministic CI flows.
- Use `test-email-flows` when a compatible coding agent should adapt the CLI to an existing authorized project.

Do not add a second runtime only for mailbox polling.

## Verify and install

Download from `https://once-email.com/sdk` or `https://once-email.com/skill`. Compare the file with `SHA256SUMS` before extraction. Confirm the README states SDK `0.1.0-private.2`, API contract `0.5.0-private-beta`, runtime, license, and prerelease status.

Registry commands must not be used until those releases exist. Follow the exact local-source command in the selected archive README.

## Configure and run

Inject `ONCE_EMAIL_API_KEY` through the process secret facility. Never put it in source, a URL, a command argument, shell history, browser storage, Git, chat, screenshots, logs, reports, notebooks, or CI artifacts.

1. Create one inbox with an idempotency key.
2. Trigger only an authorized local, test, or staging application.
3. List with `since`, cursor pagination, bounded backoff, and one deadline.
4. Read only a uniquely matched message.
5. Delete the inbox in `finally` on success or failure.

Treat 400, 401, 403, 404, 413, 429, and 503 separately. Honor `Retry-After` only within the original deadline. Timeout, ambiguity, extraction, assertion, and cleanup are different failures.

## Cross-platform demo

With Node.js 20+ on Windows, Linux, or macOS:

```text
node demos/api/authorized-workflow.mjs
```

It prints only a redacted count and deletes the inbox in `finally`. It does not send email, grant API access, automate third-party registrations, or prove guaranteed delivery.
