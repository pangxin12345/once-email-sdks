#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
sdk_root="$root/sdks"
skill_root="$root/skills"
banned='OpenAPI[- ]Generator|openapi-generator\.tech|github\.com/(openapitools|OpenAPITools)/openapi-generator|org\.openapitools\.codegen|OpenAPIToolsType|GIT_USER_ID|GIT_REPO_ID|Unlicense'

if grep -RInE \
  --exclude-dir=node_modules --exclude-dir=target --exclude-dir=bin --exclude-dir=obj \
  "$banned" "$sdk_root"; then
  printf 'SDK branding gate failed: generator branding, template placeholders, or obsolete licensing remain.\n' >&2
  exit 1
fi

if [[ -d "$skill_root" ]] && grep -RInE "$banned" "$skill_root"; then
  printf 'Skill branding gate failed: generator branding, template placeholders, or obsolete licensing remain.\n' >&2
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
  if ! grep -qE 'https://once-email\.com' "$file"; then
    printf 'SDK branding gate failed: official website missing from %s\n' "$file" >&2
    exit 1
  fi
done

grep -qE 'https://once-email\.com' "$skill_root/test-email-flows/README.md" || {
  printf 'Skill branding gate failed: official website missing.\n' >&2
  exit 1
}

printf 'SDK branding gate passed for seven ecosystems.\n'
