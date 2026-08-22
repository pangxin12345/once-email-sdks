#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"

required=(
  "$root/LOCAL-USAGE.md"
  "$root/sdks/typescript/README.md"
  "$root/sdks/python/README.md"
  "$root/sdks/java/README.md"
  "$root/sdks/go/README.md"
  "$root/sdks/dotnet/README.md"
  "$root/sdks/php/README.md"
  "$root/sdks/ruby/README.md"
  "$root/skills/test-email-flows/README.md"
  "$root/skills/test-email-flows/SKILL.md"
)

for file in "${required[@]}"; do
  test -s "$file" || { printf 'Missing documentation: %s\n' "$file" >&2; exit 1; }
done

for file in "$root"/sdks/*/README.md; do
  grep -q '0.5.0-private-beta' "$file" || { printf 'API contract missing: %s\n' "$file" >&2; exit 1; }
  grep -qiE 'install|installation|build|commands' "$file" || { printf 'Local install/build missing: %s\n' "$file" >&2; exit 1; }
  grep -qiE 'public access is not open|not a .*release|not yet (published|available)|prerelease' "$file" || { printf 'Release boundary missing: %s\n' "$file" >&2; exit 1; }
done

unsafe='print_r\(\$result\)|Debug\.WriteLine\(result\)|System\.out\.println\(result\)|^[[:space:]]*p result|Response from `DefaultAPI|Data: #\{data\.inspect\}|Response body: .*getData|Full HTTP response|YOUR_(ACCESS|BEARER)_TOKEN'
if grep -RInE --include='*.md' --include='*.rb' "$unsafe" "$root/sdks"; then
  printf 'Documentation safety gate failed: an example prints sensitive response data or embeds a key placeholder.\n' >&2
  exit 1
fi

grep -q '\$CODEX_HOME/skills' "$root/skills/test-email-flows/README.md" || { echo 'Codex installation path missing' >&2; exit 1; }
grep -q 'cleanup=cleaned' "$root/skills/test-email-flows/README.md" || { echo 'Skill cleanup contract missing' >&2; exit 1; }
grep -q 'ONCE_EMAIL_API_KEY' "$root/LOCAL-USAGE.md" || { echo 'Secret configuration missing' >&2; exit 1; }

printf 'Developer documentation gate passed for API, seven SDKs, CLI, and Skill.\n'
