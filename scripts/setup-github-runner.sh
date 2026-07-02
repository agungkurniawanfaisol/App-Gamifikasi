#!/usr/bin/env bash
# Install a GitHub Actions self-hosted runner on this VPS (one-time).
# The runner connects OUT to GitHub — no inbound SSH from GitHub needed.
#
# Before running:
#   1. GitHub repo → Settings → Actions → Runners → New self-hosted runner
#   2. Copy the registration token from the page (valid ~1 hour)
#
# Usage:
#   sudo bash scripts/setup-github-runner.sh
set -euo pipefail

REPO="agungkurniawanfaisol/App-Gamifikasi"
RUNNER_DIR="${RUNNER_DIR:-/home/container/actions-runner}"
RUNNER_USER="${RUNNER_USER:-root}"

if [ "$(id -u)" -ne 0 ]; then
  echo "Run as root: sudo bash $0"
  exit 1
fi

if [ -z "${RUNNER_TOKEN:-}" ]; then
  echo "Get a token from:"
  echo "  https://github.com/${REPO}/settings/actions/runners/new"
  echo ""
  read -r -p "Paste registration token: " RUNNER_TOKEN
fi

if [ -z "$RUNNER_TOKEN" ]; then
  echo "Token is required."
  exit 1
fi

RUNNER_VERSION="$(curl -fsSL https://api.github.com/repos/actions/runner/releases/latest | grep '"tag_name"' | head -1 | cut -d'"' -f4 | sed 's/^v//')"
ARCH="x64"
PKG="actions-runner-linux-${ARCH}-${RUNNER_VERSION}.tar.gz"

mkdir -p "$RUNNER_DIR"
cd "$RUNNER_DIR"

if [ ! -f "./config.sh" ]; then
  echo "==> Download runner v${RUNNER_VERSION}"
  curl -fsSL -o "$PKG" "https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/${PKG}"
  tar xzf "$PKG"
  rm -f "$PKG"
fi

echo "==> Configure runner for ${REPO}"
./config.sh \
  --url "https://github.com/${REPO}" \
  --token "$RUNNER_TOKEN" \
  --name "srv1796290" \
  --labels "self-hosted,linux,vps" \
  --work "_work" \
  --unattended \
  --replace

echo "==> Install systemd service"
./svc.sh install "$RUNNER_USER"
./svc.sh start

echo ""
echo "Done. Runner status:"
./svc.sh status || true
echo ""
echo "Push to main will now trigger deploy via self-hosted runner."
echo "Check: https://github.com/${REPO}/settings/actions/runners"
