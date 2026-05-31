#!/usr/bin/env bash
# One-time server bootstrap (Ubuntu 22.04+). Run as root or with sudo.
set -euo pipefail

DEPLOY_USER="${DEPLOY_USER:-deploy}"
DEPLOY_PATH="${DEPLOY_PATH:-/opt/sadafgold}"

echo "==> Installing Docker..."
if ! command -v docker >/dev/null 2>&1; then
  apt-get update
  apt-get install -y ca-certificates curl gnupg
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
    $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
fi

echo "==> Creating deploy user..."
if ! id "$DEPLOY_USER" &>/dev/null; then
  useradd -m -s /bin/bash "$DEPLOY_USER"
  usermod -aG docker "$DEPLOY_USER"
fi

echo "==> Creating deploy directory: $DEPLOY_PATH"
mkdir -p "$DEPLOY_PATH"
chown -R "$DEPLOY_USER:$DEPLOY_USER" "$DEPLOY_PATH"

echo "==> Configuring log rotation for Docker..."
cat >/etc/logrotate.d/docker-containers <<'EOF'
/var/lib/docker/containers/*/*.log {
  rotate 7
  daily
  compress
  missingok
  delaycompress
  copytruncate
}
EOF

echo "==> Enabling unattended security upgrades (optional)..."
if command -v apt-get >/dev/null 2>&1; then
  apt-get install -y unattended-upgrades 2>/dev/null || true
fi

echo "==> Server ready."
echo "    1. Clone repo to $DEPLOY_PATH as $DEPLOY_USER"
echo "    2. Copy .env.production.example → .env.production"
echo "    3. Point DNS (retail, wholesale, admin, api) to this host"
echo "    4. Run: ./scripts/deploy.sh"
