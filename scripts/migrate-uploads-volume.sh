#!/usr/bin/env bash
# One-time: copy files from the old Docker named volume into ./public/uploads
# Run on the VPS from the project root after switching to bind-mount uploads.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

mkdir -p public/uploads

for vol in next-gamifikasi_uploads_data Next-Gamifikasi_uploads_data gamifikasi_uploads_data; do
  if docker volume inspect "$vol" >/dev/null 2>&1; then
    echo "Copying from volume: $vol"
    docker run --rm \
      -v "${vol}:/from:ro" \
      -v "${ROOT}/public/uploads:/to" \
      alpine:3.20 \
      sh -c "cp -a /from/. /to/ 2>/dev/null || true"
    echo "Done. Files in public/uploads:"
    find public/uploads -type f | head -20
    exit 0
  fi
done

echo "No legacy uploads_data volume found (OK if this is a fresh server)."
