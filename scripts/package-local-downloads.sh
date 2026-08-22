#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
output="${1:-$root/dist/local-downloads}"
version="0.1.0-private.2"
temp_root="$(mktemp -d "${TMPDIR:-/tmp}/once-email-local-downloads.XXXXXX")"
trap 'rm -rf "$temp_root"' EXIT

"$root/scripts/check-branding.sh"
"$root/scripts/check-documentation.sh"
rm -rf "$output"
mkdir -p "$output/sdk"

copy_tree() {
  local source="$1" target="$2"
  mkdir -p "$target"
  rsync -a \
    --exclude='.DS_Store' --exclude='.git' --exclude='node_modules' \
    --exclude='.npm-cache' --exclude='target' --exclude='bin' --exclude='obj' \
    --exclude='vendor' --exclude='.bundle' --exclude='.venv' --exclude='__pycache__' \
    "$source/" "$target/"
}

for slug in typescript python java go dotnet php ruby; do
  archive="once-email-${slug}-sdk-${version}.zip"
  folder="once-email-${slug}-sdk-${version}"
  copy_tree "$root/sdks/$slug" "$temp_root/$folder"
  cp "$root/LOCAL-USAGE.md" "$temp_root/$folder/LOCAL-USAGE.md"
  (cd "$temp_root" && zip -q -r "$output/sdk/$archive" "$folder")
  rm -rf "$temp_root/$folder"
done

skill_folder="test-email-flows-${version}"
copy_tree "$root/skills/test-email-flows" "$temp_root/$skill_folder/test-email-flows"
(cd "$temp_root" && zip -q -r "$output/test-email-flows-${version}.zip" "$skill_folder")
rm -rf "$temp_root/$skill_folder"

demo_folder="once-email-developer-demo-${version}"
mkdir -p "$temp_root/$demo_folder"
copy_tree "$root/demos" "$temp_root/$demo_folder/demos"
cp "$root/README.md" "$temp_root/$demo_folder/README.md"
cp "$root/LOCAL-USAGE.md" "$temp_root/$demo_folder/LOCAL-USAGE.md"
cp "$root/LICENSE" "$temp_root/$demo_folder/LICENSE"
(cd "$temp_root" && zip -q -r "$output/once-email-developer-demo-${version}.zip" "$demo_folder")

(cd "$output/sdk" && shasum -a 256 ./*.zip > SHA256SUMS)
(cd "$output" && shasum -a 256 ./*.zip > SHA256SUMS)
sed 's#  \./#  sdk/#' "$output/sdk/SHA256SUMS" >> "$output/SHA256SUMS"

printf 'Website local downloads created in %s\n' "$output"
