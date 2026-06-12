#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

mkdir -p backups

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

: "${MYSQL_DATABASE:=gamifikasi}"
: "${MYSQL_ROOT_PASSWORD:?Set MYSQL_ROOT_PASSWORD in .env}"

OUTPUT="${1:-backups/gamifikasi-$(date +%Y%m%d-%H%M%S).sql}"

if ! docker compose ps mysql --status running >/dev/null 2>&1; then
  echo "Error: MySQL container is not running. Start the stack first." >&2
  exit 1
fi

docker compose exec -T mysql mysqldump \
  -u root \
  -p"${MYSQL_ROOT_PASSWORD}" \
  --single-transaction \
  --routines \
  --triggers \
  --add-drop-table \
  "${MYSQL_DATABASE}" > "${OUTPUT}"

echo "Backup saved to ${OUTPUT}"
