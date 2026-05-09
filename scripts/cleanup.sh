#!/usr/bin/env bash
# Wipe transient build/cache directories across the monorepo.
# Usage: pnpm cleanup [--node-modules]
#   --node-modules  also remove all node_modules directories (forces a re-install)

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

REMOVE_NODE_MODULES=false
for arg in "$@"; do
  case "$arg" in
    --node-modules) REMOVE_NODE_MODULES=true ;;
    -h|--help)
      head -5 "$0" | tail -n +2
      exit 0
      ;;
    *) echo "unknown flag: $arg" >&2; exit 1 ;;
  esac
done

CLEANED=()

remove_dirs() {
  local pattern="$1"
  while IFS= read -r -d '' dir; do
    rm -rf "$dir"
    CLEANED+=("$dir")
  done < <(find . -name "$pattern" -type d -not -path "*/node_modules/*" -prune -print0)
}

# Always-clean caches
for pattern in .next .turbo dist .wrangler coverage .vitest-cache; do
  remove_dirs "$pattern"
done

# Optional: nuke node_modules to force a fresh install
if [ "$REMOVE_NODE_MODULES" = true ]; then
  while IFS= read -r -d '' dir; do
    rm -rf "$dir"
    CLEANED+=("$dir")
  done < <(find . -name node_modules -type d -prune -print0)
fi

if [ ${#CLEANED[@]} -eq 0 ]; then
  echo "Nothing to clean."
else
  printf 'Removed %d directories:\n' "${#CLEANED[@]}"
  printf '  %s\n' "${CLEANED[@]}"
fi
