#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/docs/doom"
DEST="$ROOT/extension/doom"
mkdir -p "$DEST"
ICON_DIR="$ROOT/extension/icons"
mkdir -p "$ICON_DIR"

copy_if() {
  local f="$1"
  if [[ -f "$SRC/$f" ]]; then
    cp "$SRC/$f" "$DEST/$f"
    echo "  copied $f"
  else
    echo "  skip $f (run: npm run fetch-assets)"
  fi
}

echo "Syncing $SRC -> $DEST"
if [[ ! -f "$SRC/player.html" || ! -f "$SRC/player-shell.js" ]]; then
  echo "Missing docs/doom/player.html or player-shell.js"
  exit 1
fi
cp "$SRC/player.html" "$DEST/player.html"
cp "$SRC/player-shell.js" "$DEST/player-shell.js"
copy_if index.js
copy_if index.wasm
copy_if index.data

export ROOT
python3 << 'PY'
import os
import struct
import zlib

root = os.environ["ROOT"]
icon_dir = os.path.join(root, "extension", "icons")


def chunk(tag, data):
    crc = zlib.crc32(tag + data) & 0xFFFFFFFF
    return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", crc)


def write_png(path, w, h, r, g, b):
    raw = bytearray()
    for _y in range(h):
        raw.append(0)
        for _x in range(w):
            raw.extend([r, g, b, 255])
    png = (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0))
        + chunk(b"IDAT", zlib.compress(bytes(raw), 9))
        + chunk(b"IEND", b"")
    )
    with open(path, "wb") as f:
        f.write(png)


os.makedirs(icon_dir, exist_ok=True)
write_png(os.path.join(icon_dir, "icon16.png"), 16, 16, 180, 40, 40)
write_png(os.path.join(icon_dir, "icon48.png"), 48, 48, 180, 40, 40)
write_png(os.path.join(icon_dir, "icon128.png"), 128, 128, 180, 40, 40)
print("  wrote extension/icons/icon16.png, icon48.png, icon128.png")
PY

echo "Done."
