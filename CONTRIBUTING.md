# Contributing

Changes begin in the versioned OpenAPI contract or reviewed generator configuration, never in generated output. Run `bash ops/ci/build-all-sdk-downloads.sh` before proposing a change.

Do not include API keys, inbox addresses, message content, OTP values, links, attachments, internal endpoints, production configuration, or complete request URLs in issues, tests, commits, logs, or fixtures. Examples must use placeholders and applications the contributor owns or is authorized to test.

Generated output is reviewed as a candidate artifact and is not committed back into the service repository.
