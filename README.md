# Once Email SDKs

Official open-source SDK candidates for the [Once Email Developer API](https://once-email.com/api). The repository contains TypeScript/JavaScript, Python, Java, Go, .NET/C#, PHP, and Ruby clients tied to API contract `0.5.0-private-beta`.

The service is receive-only and these clients are intended only for local, test, or staging applications you own or are explicitly authorized to test. They do not send email, automate third-party registrations, or bypass another service's rules.

## Status

Source is open for review and integration testing. Registry packages and public API access are not yet released. Do not treat a repository clone as an active subscription or a production SLA.

## SDK directories

- [`sdks/typescript`](sdks/typescript): TypeScript core, CLI, and Playwright integration candidate
- [`sdks/python`](sdks/python): Python 3.11+ client and wheel source
- [`sdks/java`](sdks/java): Java client
- [`sdks/go`](sdks/go): Go client
- [`sdks/dotnet`](sdks/dotnet): .NET 8/C# client
- [`sdks/php`](sdks/php): PHP client
- [`sdks/ruby`](sdks/ruby): Ruby client
- [`spec/openapi.json`](spec/openapi.json): reviewed machine contract
- [`skills/test-email-flows`](skills/test-email-flows): installable Skill candidate for authorized staging email-flow tests

Read [local usage](LOCAL-USAGE.md), [security](SECURITY.md), and the README in the selected language directory before integrating. Keep API keys out of source, URLs, logs, screenshots, browser storage, and CI artifacts; delete temporary inboxes in `finally`.

Canonical documentation: [once-email.com/api](https://once-email.com/api)

For a routine change, run `scripts/release-all.sh candidate`. Maintainers can run `scripts/release-all.sh publish sdk-vX.Y.Z` to create and push a validated release tag; GitHub waits for the same commit's native matrix before publishing immutable release assets.
