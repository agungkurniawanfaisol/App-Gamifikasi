#!/usr/bin/env bash
# Poll GitHub for new commits and deploy when main changes.
# Cron example (every 5 min): */5 * * * * /home/container/Next-Gamifikasi/scripts/poll-deploy.sh >> /var/log/gamifikasi-deploy.log 2>&1
set -euo pipefail

APP_DIR="${APP_DIR:-/home/container/Next-Gamifikasi}"
cd "$APP_DIR"

git fetch origin main -q
LOCAL="$(git rev-parse HEAD)"
REMOTE="$(git rev-parse origin/main)"

if [ "$LOCAL" = "$REMOTE" ]; then
  exit 0
fi

echo "$(date -Is) New commit on main ($LOCAL -> $REMOTE), deploying..."
bash "$APP_DIR/scripts/deploy.sh"
