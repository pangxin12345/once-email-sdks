# Once Email Test

SDK/CLI `0.1.0-private.2` · API contract `0.5.0-private-beta` · Node.js 20+ · MIT

Official private release candidate for deterministic email OTP tests against applications you own or are explicitly authorized to test. Public npm publication is not open yet.

## Supported systems

Node.js 20 or newer on Windows, Linux, and macOS. The command, configuration schema, redacted report, stable exit codes, single deadline, and cleanup contract are identical on all three systems. Native CI must pass before a public release.

## Commands

```text
once-email-test doctor --config once-email.test.yaml
once-email-test plan --config once-email.test.yaml
once-email-test run --config once-email.test.yaml --report reports/email-flow.json
once-email-test cleanup --run-file .once-email/run/<run-id>.json
```

Start with `doctor`, validate `plan`, run exactly one authorized flow, and require cleanup result `cleaned`. The API key stays in the configured environment source. Addresses and OTPs travel only through stdin or in-process callbacks and never belong in arguments, reports, Git, screenshots, traces, or CI artifacts.

Canonical usage, configuration, failure, Playwright, privacy, and migration documentation: `https://once-email.com/sdk` and `https://once-email.com/skill`. Public source is available from the official repository; language-registry installation is not yet available.

## Safety boundary

Only local, test, or staging systems owned by you or explicitly authorized are allowed. Public third-party sites, production-user flows, bulk registration, policy evasion, inbox browsing, automatic link opening, and attachment processing are outside the product contract.

See [SECURITY.md](SECURITY.md) for private reporting. MIT licensed; no warranty of delivery or attachment safety.
