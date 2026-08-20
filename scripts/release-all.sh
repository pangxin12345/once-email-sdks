#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
mode="${1:-candidate}"
tag="${2:-}"

case "$mode" in
  candidate) ;;
  publish)
    [[ "$tag" =~ ^sdk-v[0-9]+\.[0-9]+\.[0-9]+([.-][0-9A-Za-z.-]+)?$ ]] || {
      echo "Usage: scripts/release-all.sh publish sdk-vX.Y.Z[-prerelease]" >&2
      exit 2
    }
    command -v gh >/dev/null || { echo "GitHub CLI is required for publishing" >&2; exit 2; }
    ;;
  *) echo "Usage: scripts/release-all.sh candidate | publish sdk-vX.Y.Z" >&2; exit 2 ;;
esac

if [[ "$mode" == candidate ]] && \
   ! (command -v dotnet >/dev/null 2>&1 && dotnet --list-sdks 2>/dev/null | grep -q '^8\.') && \
   ! (command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1); then
  command -v gh >/dev/null || {
    echo "Local .NET 8 is unavailable; install Docker or GitHub CLI for the remote candidate fallback" >&2
    exit 1
  }
  gh workflow run package-candidates.yml --repo pangxin12345/once-email-sdks --ref main
  sleep 4
  run_id="$(gh run list --repo pangxin12345/once-email-sdks --workflow package-candidates.yml --limit 1 --json databaseId --jq '.[0].databaseId')"
  gh run watch "$run_id" --repo pangxin12345/once-email-sdks --exit-status
  rm -rf "$root/dist/registry-candidates"
  gh run download "$run_id" --repo pangxin12345/once-email-sdks --name registry-candidates --dir "$root/dist/registry-candidates"
  echo "Remote seven-SDK and Skill candidate downloaded to $root/dist/registry-candidates"
  exit 0
fi

bash "$root/scripts/package-all.sh"

if [[ "$mode" == publish ]]; then
  git -C "$root" diff --quiet && git -C "$root" diff --cached --quiet || {
    echo "Refusing to publish with uncommitted changes" >&2
    exit 1
  }
  git -C "$root" tag "$tag"
  git -C "$root" push origin "$tag"
  gh run watch --repo pangxin12345/once-email-sdks --exit-status "$(gh run list --repo pangxin12345/once-email-sdks --workflow package-candidates.yml --limit 1 --json databaseId --jq '.[0].databaseId')"
fi

echo "Once Email developer artifacts completed in $root/dist/registry-candidates"
