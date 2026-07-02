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

echo "==> Build and start stack"
docker compose $COMPOSE_FILES up --build -d
docker compose ps
docker image prune -f
echo "==> Deploy complete"
