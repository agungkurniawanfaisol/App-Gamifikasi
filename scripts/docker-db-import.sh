#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

: "${MYSQL_DATABASE:=gamifikasi}"
: "${MYSQL_ROOT_PASSWORD:?Set MYSQL_ROOT_PASSWORD in .env}"

FILE="${1:?Usage: ./scripts/docker-db-import.sh <backup.sql>}"

if [[ ! -f "${FILE}" ]]; then
  echo "Error: file not found: ${FILE}" >&2
  exit 1
fi

if ! docker compose ps mysql --status running >/dev/null 2>&1; then
  echo "Error: MySQL container is not running. Start the stack first." >&2
  exit 1
fi

echo "Importing ${FILE} into database '${MYSQL_DATABASE}'..."
echo "This replaces existing tables included in the dump."

docker compose exec -T mysql mysql \
  -u root \
  -p"${MYSQL_ROOT_PASSWORD}" \
  "${MYSQL_DATABASE}" < "${FILE}"

echo "Import finished."
