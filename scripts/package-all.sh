#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
dist="$root/dist/registry-candidates"
rm -rf "$dist"
mkdir -p "$dist"
mkdir -p "$root/.package-cache/npm"

"$root/scripts/check-branding.sh"

(cd "$root/sdks/typescript" && npm ci --ignore-scripts --cache "$root/.package-cache/npm" && npm run build && npm pack --ignore-scripts --cache "$root/.package-cache/npm" --pack-destination "$dist")
python3 -m venv "$root/.package-cache/python"
"$root/.package-cache/python/bin/python" -m pip install --disable-pip-version-check build >/dev/null
"$root/.package-cache/python/bin/python" -m build --outdir "$dist" "$root/sdks/python"
mvn --batch-mode --no-transfer-progress -f "$root/sdks/java/pom.xml" package
cp "$root"/sdks/java/target/*.jar "$dist/"
if command -v dotnet >/dev/null 2>&1 && dotnet --list-sdks 2>/dev/null | grep -q '^8\.'; then
  (cd "$root/sdks/dotnet" && dotnet pack --configuration Release --output "$dist" --nologo)
elif command -v docker >/dev/null 2>&1; then
  docker run --rm \
    -v "$root:/workspace" -w /workspace/sdks/dotnet \
    mcr.microsoft.com/dotnet/sdk:8.0 \
    dotnet pack --configuration Release --output /workspace/dist/registry-candidates --nologo
else
  echo "A working .NET 8 SDK or Docker is required to package the .NET SDK" >&2
  exit 1
fi
composer validate --strict "$root/sdks/php/composer.json"
tar -C "$root/sdks" -czf "$dist/once-email-php-0.1.0-beta.2.tar.gz" php
tar -C "$root/sdks" -czf "$dist/once-email-go-0.1.0-private.2.tar.gz" go
gem build --output "$dist/once-email-sdk-0.1.0.pre.2.gem" "$root/sdks/ruby/once_email.gemspec"
tar -C "$root/skills" -czf "$dist/test-email-flows-skill-0.1.0-private.2.tar.gz" test-email-flows
tar -C "$root" -czf "$dist/once-email-api-and-skill-demos-0.1.0-private.2.tar.gz" demos

(cd "$dist" && shasum -a 256 ./* > SHA256SUMS)
printf 'Registry candidate artifacts created in %s\n' "$dist"
