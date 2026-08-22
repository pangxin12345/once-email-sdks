# Test Email Flows Skill

Official Once Email Skill candidate for adding or diagnosing one real email OTP test in a user-owned or explicitly authorized local, test, or staging project.

The Skill reuses the target project's existing Playwright or test framework, runs `doctor` and `plan`, invokes the Once Email CLI/Core, validates only redacted reports, and requires cleanup. It never reads or repeats an address, OTP, confirmation link, message body, attachment, API key, or cleanup journal into model context.

Public third-party sites, production users, bulk registration, policy evasion, inbox browsing, automatic link opening, and attachment processing are refused. Canonical documentation is prepared at `https://once-email.com/blog`; the official source link will be added only after the repository and anonymous download are verified.

Start with the safe [prompts](../../demos/skill/PROMPTS.md) and [authorized demo](../../demos/skill/DEMO.md). They use placeholders and keep sensitive values outside model context.
