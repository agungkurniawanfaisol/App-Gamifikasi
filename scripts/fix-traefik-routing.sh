#!/usr/bin/env bash
# Run on VPS (Hostinger browser terminal / SSH) when domain returns 404/502
# while http://127.0.0.1:5174/ still works.
set -euo pipefail

APP_DIR="${APP_DIR:-/home/container/Next-Gamifikasi}"
cd "$APP_DIR"

if [ ! -f .env ]; then
  echo "ERROR: .env missing in $APP_DIR"
  exit 1
fi

# Prefer existing TRAEFIK_HOST; default to deeplink (matches production AUTH_URL redirect).
if ! grep -q '^TRAEFIK_HOST=' .env; then
  echo "TRAEFIK_HOST=deeplink.universitaspgridelta.ac.id" >> .env
  echo "==> Added TRAEFIK_HOST=deeplink.universitaspgridelta.ac.id"
fi

TRAEFIK_HOST="$(grep -E '^TRAEFIK_HOST=' .env | head -1 | cut -d= -f2- | tr -d '"' | tr -d "'")"
echo "==> TRAEFIK_HOST=$TRAEFIK_HOST"

COMPOSE="docker compose -f docker-compose.yml -f docker-compose.traefik.yml"

echo "==> Recreate nextjs with Traefik labels"
$COMPOSE up -d --force-recreate nextjs

echo "==> Status"
$COMPOSE ps

echo "==> Local app"
curl -sS -o /dev/null -w "5174=%{http_code}\n" --max-time 10 "http://127.0.0.1:5174/" || true

echo "==> Traefik Host check (expect 200/301/302/307, not 404)"
curl -skS -o /dev/null -w "https_host=%{http_code}\n" --max-time 10 \
  -H "Host: ${TRAEFIK_HOST}" "https://127.0.0.1/" || true

echo
echo "If Traefik still 404: ensure container is on Traefik docker network and Traefik is running:"
echo "  docker network ls | grep -i traefik"
echo "  docker ps --filter name=traefik"
echo
echo "DNS (Hostinger): A record ${TRAEFIK_HOST} -> this VPS public IP"
echo "  Current VPS hostname IP tip: dig +short srv1796290.hstgr.cloud"
