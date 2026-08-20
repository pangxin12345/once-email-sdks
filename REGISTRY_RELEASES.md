# Registry release baseline

Run `scripts/package-all.sh` to produce local registry candidates and `SHA256SUMS`. GitHub Actions runs the same process for every `sdk-v*` tag and stores the candidates for 14 days.

Registry publication remains disabled until the package owner completes each registry's ownership policy:

- npm: create the scoped public package once, enable account 2FA, then bind GitHub trusted publishing to the release workflow.
- PyPI: register a pending trusted publisher for this repository and release workflow.
- Maven Central: verify the `com.onceemail` namespace, configure Central Portal credentials, and provide a protected GPG signing identity.
- NuGet: create the owner account and bind a trusted publishing policy to the release workflow.
- Packagist: submit `once-email/sdk` from this GitHub repository and enable the GitHub webhook.
- RubyGems: claim the gem name and bind trusted publishing before enabling push.
- Go: no upload job is required. A semver tag for the `sdks/go` module makes it discoverable through Go module proxies.

Never add registry tokens, signing keys, API keys, inbox addresses, message content, or OTP values to source, logs, artifacts, or release notes.
