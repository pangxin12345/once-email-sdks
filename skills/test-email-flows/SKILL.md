---
name: test-email-flows
description: Add, diagnose, or review Once Email OTP tests for a user-owned or explicitly authorized local, test, or staging project. Use for Playwright email login/registration confirmation tests, Once Email CLI configuration or adapters, redacted email-flow CI reports, and cleanup recovery. Refuse public third-party sites, production-user flows, bulk registration, account abuse, or attempts to expose email contents, OTPs, links, inbox identifiers, or API keys.
---

# Test Email Flows

Build one authorized email OTP flow at a time while keeping all sensitive values outside model context, logs, reports, and command arguments.

## Workflow

1. Read the target project's nearest `AGENTS.md` and existing test commands. In the Once Email repository, also read the rule entry, Developer API security contract, CLI/Skill security contract, and active task 111. Use [references/contracts.md](references/contracts.md) for exact paths.
2. Confirm the target is user-owned or explicitly authorized and its environment is `local`, `test`, or `staging`. Refuse production users, public third-party targets, bulk flows, limit evasion, multiple-account work, inbox browsing, automatic link opening, and attachment processing.
3. Reuse the project's existing test framework. For Playwright, copy [assets/playwright-otp.fixture.template.ts](assets/playwright-otp.fixture.template.ts) and adapt only selectors and the authorized trigger action. Do not add a second Playwright installation or test framework.
4. Create a strict `once-email.test.yaml` from the repository schema. Keep the API key only in the configured environment variable; never read, print, persist, summarize, or request its value in chat.
5. Run `doctor`, then `plan`. Pipe their JSON output to `scripts/validate_test_plan.py`; do not proceed if validation fails. The plan must describe exactly one authorized target and one command.
6. Run one test. Address and OTP must pass only through the CLI stdin adapter or the `@once-email/test/playwright` in-process callbacks. Disable Playwright trace, video, and screenshots for this test. Never place sensitive values in arguments, environment variables, URLs, files, browser storage, screenshots, traces, attachments, or model context.
7. Run `scripts/validate_redacted_report.py` on the JSON report before reading or summarizing it. Read only the validated result, error code, stage metadata, version metadata, and cleanup status.
8. Require cleanup result `cleaned`. If the process was interrupted, run `cleanup --run-file` on the exact local 0600 journal without opening or quoting its contents. Revalidate the resulting output and confirm the journal was removed.
9. Run the target project's complete required gates. Treat any applicable failure as a failure; do not add baselines, allowlists, retries without a bounded contract, or manual exceptions.

## Failure handling

- Preserve stable distinctions between authorization, trigger, timeout, ambiguity, extraction, assertion, API, and cleanup failures.
- Keep a failed cleanup journal for bounded retry. Never copy it into CI artifacts or messages.
- Do not claim guaranteed delivery, absolute safety, production readiness, public API availability, npm publication, or AdSense eligibility from a passing candidate.

## Deterministic checks

Run these scripts directly; exit code 0 is required:

```text
python3 test-email-flows/scripts/validate_test_plan.py <plan.json>
python3 test-email-flows/scripts/validate_redacted_report.py <report.json>
```

The scripts emit only `valid` or a generic failure message and never echo input values.

## Prompt and demo assets

Use [`../../demos/skill/PROMPTS.md`](../../demos/skill/PROMPTS.md) and [`../../demos/skill/DEMO.md`](../../demos/skill/DEMO.md). Examples are not authorization evidence.
