# Test Email Flows Skill

Version `0.1.0-private.2` · API contract `0.5.0-private-beta` · MIT

Use this Skill to add or diagnose exactly one email OTP or confirmation flow in a local, test, or staging application you own or are explicitly authorized to test. It validates a redacted plan and report and requires inbox cleanup.

It refuses public third-party targets, production-user flows, bulk registration, policy evasion, inbox browsing, automatic link opening, and attachment processing. API keys, inbox addresses, messages, OTPs, links, attachments, and cleanup journals must remain outside model context.

## Download and verify

Download `https://once-email.com/downloads/test-email-flows-0.1.0-private.2.zip` and compare its SHA-256 with `https://once-email.com/downloads/SHA256SUMS` before extracting it. The archive must contain this whole folder, including `SKILL.md`, `agents/`, `assets/`, `references/`, and `scripts/`.

## Install in Codex

1. Locate the Codex Skills home. The usual personal location is `$CODEX_HOME/skills`; when `CODEX_HOME` is unset, use `~/.codex/skills`.
2. Copy the complete extracted `test-email-flows` folder into that directory. Do not copy only `SKILL.md`.
3. Reload Codex or start a new task so Skills are rediscovered.
4. Confirm `test-email-flows` appears in the available Skills list.
5. Invoke it explicitly for the first run: `$test-email-flows add one safe OTP test to my authorized staging project`.

For another compatible agent, install the same complete folder in that product's documented Skill directory. Do not guess a directory or flatten the bundle.

## Prepare the project

- Use an application and non-production environment you own or have explicit authorization to test.
- Keep the API key in the project's process secret facility under `ONCE_EMAIL_API_KEY`; never paste it into chat, source, a URL, a command argument, a screenshot, or Git.
- Keep the existing Playwright or test framework. Disable trace, video, and screenshots for the sensitive flow.

## First run

```text
$test-email-flows add one email OTP test to this authorized staging project.
Run doctor and plan first. Do not read or print the API key, inbox address,
message, OTP, link, or cleanup journal. Run exactly one flow and require
cleanup=cleaned.
```

The Skill inspects the existing tests, prepares `once-email.test.yaml`, runs and validates `doctor` and `plan`, runs one authorized test, validates the redacted report, and requires `cleanup=cleaned`.

An acceptable model-visible result contains only non-sensitive status metadata:

```json
{"result":"passed","stage":"complete","cleanup":"cleaned"}
```

If interrupted, run cleanup only against the exact local `0600` journal. Do not open, quote, upload, or attach it. A cleanup failure is a failed test.

## Validate the bundle

```text
python3 skills/test-email-flows/scripts/validate_test_plan.py skills/test-email-flows/references/plan-output.sample.json
python3 skills/test-email-flows/scripts/validate_redacted_report.py skills/test-email-flows/references/failure-timeout.sample.json
```

Each command prints only `valid` on success. Maintainers also run Skill Creator `quick_validate.py` against the complete folder.

See [`SKILL.md`](SKILL.md), the safe [prompts](../../demos/skill/PROMPTS.md), the [authorized demo](../../demos/skill/DEMO.md), and the canonical [website guide](https://once-email.com/skill).
