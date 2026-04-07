#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT/docs"
PORT="${PORT:-8765}"
echo "Serving $ROOT/docs at http://127.0.0.1:${PORT}/"
echo "If the game does not load, run: ./scripts/fetch-web-doom.sh"
exec python3 -m http.server "$PORT"
