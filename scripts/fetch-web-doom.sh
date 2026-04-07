#!/usr/bin/env bash
# Downloads prebuilt Emscripten artifacts (same build lineage as
# https://github.com/AzazelN28/web-doom — see player HTML / upstream LICENSE).
# Files are served from the author's site; mirror them locally for GitHub Pages offline builds.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/docs/doom"
mkdir -p "$OUT"

# neocities.org URLs redirect to azazeln28.com
BASE="${DOOM_WASM_BASE:-https://azazeln28.com/games/doom}"

for f in index.js index.wasm index.data; do
  echo "Fetching $BASE/$f ..."
  curl -fsSL -o "$OUT/$f" "$BASE/$f"
done

echo "Wrote:"
ls -la "$OUT"/index.js "$OUT"/index.wasm "$OUT"/index.data
echo "Done."
