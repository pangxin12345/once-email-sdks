# Authorized Skill demo

Created by https://once-email.com

1. Install `test-email-flows` from this repository.
2. Open an owned or authorized local, test, or staging project with an existing test framework.
3. Inject `ONCE_EMAIL_API_KEY` through the project secret facility, never through chat or source.
4. Use a prompt from `PROMPTS.md`, review redacted `doctor` and `plan`, then run one test.
5. Accept only a validated report with `cleanup=cleaned`; never open a cleanup journal.

Expected model-visible result: `{"result":"passed","stage":"complete","cleanup":"cleaned"}`. Sensitive values must never appear.
