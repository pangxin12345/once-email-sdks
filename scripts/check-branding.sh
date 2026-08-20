#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
sdk_root="$root/sdks"
banned='OpenAPI Generator|openapi-generator\.tech|github\.com/(openapitools|OpenAPITools)/openapi-generator|GIT_USER_ID|GIT_REPO_ID|Unlicense'

if rg -n "$banned" "$sdk_root" \
  --glob '!**/node_modules/**' --glob '!**/target/**' --glob '!**/bin/**' --glob '!**/obj/**'; then
  printf 'SDK branding gate failed: generator branding, template placeholders, or obsolete licensing remain.\n' >&2
  exit 1
fi

required=(
  "$sdk_root/typescript/package.json"
  "$sdk_root/python/pyproject.toml"
  "$sdk_root/java/pom.xml"
  "$sdk_root/go/README.md"
  "$sdk_root/dotnet/src/OnceEmail.Sdk/OnceEmail.Sdk.csproj"
  "$sdk_root/php/composer.json"
  "$sdk_root/ruby/once_email.gemspec"
)

for file in "${required[@]}"; do
  if ! rg -q 'https://once-email\.com' "$file"; then
    printf 'SDK branding gate failed: official website missing from %s\n' "$file" >&2
    exit 1
  fi
done

printf 'SDK branding gate passed for seven ecosystems.\n'
