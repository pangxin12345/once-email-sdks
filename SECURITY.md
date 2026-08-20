# Security

Use these private SDK candidates only with local, test, or staging applications you own or are explicitly authorized to test.

Do not log API keys, inbox addresses, subjects, message bodies, OTP values, links, attachment names or bytes, internal resource identifiers, or complete request URLs. Keep keys in a secrets manager, use bounded timeouts, honor `Retry-After`, reject redirects, and delete each temporary inbox in `finally`.

Report security issues through https://once-email.com/contact without including secrets or message content.
