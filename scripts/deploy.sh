#!/usr/bin/env bash
# Run on the VPS when GitHub Actions cannot reach SSH (firewall / IP block).
set -euo pipefail

APP_DIR="${APP_DIR:-/home/container/Next-Gamifikasi}"
cd "$APP_DIR"

echo "==> Pull latest main"
git fetch origin main
git reset --hard origin/main

if [ ! -f .env ]; then
  echo "ERROR: .env missing. Copy from .env.example and configure first."
  exit 1
fi

COMPOSE_FILES="-f docker-compose.yml"
if docker ps --filter "name=traefik" --format '{{.Names}}' | grep -q .; then
  if [ -f docker-compose.traefik.yml ] && grep -q '^TRAEFIK_HOST=' .env 2>/dev/null; then
    COMPOSE_FILES="$COMPOSE_FILES -f docker-compose.traefik.yml"
    echo "==> Traefik detected — applying routing labels"
  fi
fi

# Safety net: never lose existing production data.
# `docker compose up` starts the app, which auto-runs `prisma migrate deploy`.
# If a future migration is destructive, this backup makes the data recoverable.
# We take the backup BEFORE building/migrating and abort if it fails.
if docker compose $COMPOSE_FILES ps mysql --status running >/dev/null 2>&1; then
  echo "==> Backing up database before migrations"
  if bash scripts/docker-db-backup.sh; then
    echo "==> Database backup complete (see ./backups)"
  else
    echo "ERROR: database backup failed — aborting deploy to protect existing data." >&2
    echo "Fix the backup issue, or run a manual backup, then retry." >&2
    exit 1
  fi
else
  echo "==> MySQL not running yet (first deploy) — no existing data to back up, skipping"
fi

echo "==> Build and start stack"
docker compose $COMPOSE_FILES up --build -d
docker compose ps
docker image prune -f
echo "==> Deploy complete"
