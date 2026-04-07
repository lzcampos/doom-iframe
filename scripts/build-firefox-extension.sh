#!/usr/bin/env bash
# Produces dist/webdoom-firefox/ with ONLY manifest.json (Firefox scripts background).
# Firefox temporary install often still reads ./manifest.json from the folder root;
# a directory with two manifests can load the wrong one. This folder has a single manifest.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/extension"
DST="$ROOT/dist/webdoom-firefox"

if [[ ! -f "$SRC/manifest-firefox.json" ]]; then
  echo "Missing $SRC/manifest-firefox.json"
  exit 1
fi
if [[ ! -f "$SRC/doom/player.html" ]]; then
  echo "Missing extension assets. Run: npm run sync-extension"
  exit 1
fi

rm -rf "$DST"
mkdir -p "$DST"

cp -a "$SRC/doom" "$SRC/icons" "$SRC/inject" "$DST/"
cp -a "$SRC/background.js" "$SRC/panel-focus.js" "$SRC/sidepanel.html" "$SRC/player-tab.html" "$DST/"
cp -a "$SRC/manifest-firefox.json" "$DST/manifest.json"

echo "Firefox load: $DST/manifest.json"
echo "In about:debugging → Load Temporary Add-on → select that manifest.json"
