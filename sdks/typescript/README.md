# Once Email Test

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

The canonical usage, configuration, failure, Playwright, privacy, and migration documentation is prepared for `https://once-email.com/docs/sdk-cli` and `https://once-email.com/docs/skills-playwright`. Source and release links will be added only after the official GitHub repository is created and anonymously verified.

## Safety boundary

Only local, test, or staging systems owned by you or explicitly authorized are allowed. Public third-party sites, production-user flows, bulk registration, policy evasion, inbox browsing, automatic link opening, and attachment processing are outside the product contract.

See [SECURITY.md](SECURITY.md) for private reporting. MIT licensed; no warranty of delivery or attachment safety.
