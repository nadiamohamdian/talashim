#!/usr/bin/env bash
# Manual certificate renewal (certbot sidecar also renews every 12h when SSL stack is active).
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

ENV_FILE="${ENV_FILE:-.env.production}"
COMPOSE_FILES="-f docker-compose.prod.yml -f docker-compose.ssl.yml"

docker compose $COMPOSE_FILES --env-file "$ENV_FILE" \
  --profile tools run --rm certbot renew --webroot -w /var/www/certbot

docker compose $COMPOSE_FILES --env-file "$ENV_FILE" exec nginx nginx -s reload
echo "Certificates renewed and nginx reloaded."
