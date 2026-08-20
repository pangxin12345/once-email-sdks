#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
dist="$root/dist/registry-candidates"
rm -rf "$dist"
mkdir -p "$dist"

(cd "$root/sdks/typescript" && npm ci --ignore-scripts && npm run test:unit && npm pack --ignore-scripts --pack-destination "$dist")
python3 -m pip install --disable-pip-version-check build >/dev/null
python3 -m build --outdir "$dist" "$root/sdks/python"
mvn --batch-mode --no-transfer-progress -f "$root/sdks/java/pom.xml" package
cp "$root"/sdks/java/target/*.jar "$dist/"
(cd "$root/sdks/dotnet" && dotnet pack --configuration Release --output "$dist" --nologo)
composer validate --strict "$root/sdks/php/composer.json"
tar -C "$root/sdks" -czf "$dist/once-email-php-0.1.0-beta.1.tar.gz" php
tar -C "$root/sdks" -czf "$dist/once-email-go-0.1.0-private.1.tar.gz" go
gem build --output "$dist/once-email-sdk-0.1.0.pre.1.gem" "$root/sdks/ruby/once_email.gemspec"

(cd "$dist" && shasum -a 256 ./* > SHA256SUMS)
printf 'Registry candidate artifacts created in %s\n' "$dist"
