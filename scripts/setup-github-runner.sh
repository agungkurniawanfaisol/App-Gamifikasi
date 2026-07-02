#!/usr/bin/env bash
# Install a GitHub Actions self-hosted runner on this VPS (one-time).
# The runner connects OUT to GitHub — no inbound SSH from GitHub needed.
#
# Before running:
#   1. GitHub repo → Settings → Actions → Runners → New self-hosted runner
#   2. Copy the registration token from the page (valid ~1 hour)
#
# Usage (already logged in as root on VPS — do NOT prefix with sudo):
#   bash scripts/setup-github-runner.sh
set -euo pipefail

REPO="agungkurniawanfaisol/App-Gamifikasi"
RUNNER_DIR="${RUNNER_DIR:-/home/container/actions-runner}"
RUNNER_USER="$(id -un)"

if [ -n "${SUDO_USER:-}" ] && [ "$(id -u)" -eq 0 ]; then
  echo "Do not run with sudo. You are already root — use:"
  echo "  bash scripts/setup-github-runner.sh"
  exit 1
fi

if [ -z "${RUNNER_TOKEN:-}" ]; then
  echo "Get a fresh token from:"
  echo "  https://github.com/${REPO}/settings/actions/runners/new"
  echo ""
  echo "Paste with right-click (avoid arrow keys — they corrupt the token)."
  read -r -p "Paste registration token: " RUNNER_TOKEN
fi

# Strip terminal escape chars / whitespace from pasted token
RUNNER_TOKEN="$(printf '%s' "$RUNNER_TOKEN" | tr -cd '[:alnum:]')"

if [ -z "$RUNNER_TOKEN" ]; then
  echo "Token is required."
  exit 1
fi

if [ "$(id -u)" -eq 0 ]; then
  export RUNNER_ALLOW_RUNASROOT=1
  echo "==> Running as root (RUNNER_ALLOW_RUNASROOT=1)"
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
