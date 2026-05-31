#!/usr/bin/env bash
# Obtain Let's Encrypt certificate (HTTP-01 webroot). Stack must be running on port 80.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

ENV_FILE="${ENV_FILE:-.env.production}"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE" >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

: "${LETSENCRYPT_EMAIL:?Set LETSENCRYPT_EMAIL in $ENV_FILE}"
: "${RETAIL_DOMAIN:?Set RETAIL_DOMAIN}"
: "${ADMIN_DOMAIN:?Set ADMIN_DOMAIN}"
: "${API_DOMAIN:?Set API_DOMAIN}"
CERT_NAME="${CERT_NAME:-sadafgold}"

DOMAINS=(-d "$RETAIL_DOMAIN" -d "$ADMIN_DOMAIN" -d "$API_DOMAIN")
if [[ -n "${WHOLESALE_DOMAIN:-}" && "$WHOLESALE_DOMAIN" != "$RETAIL_DOMAIN" ]]; then
  DOMAINS+=(-d "$WHOLESALE_DOMAIN")
fi

echo "==> Requesting certificate for: ${DOMAINS[*]}"
docker compose -f docker-compose.prod.yml --env-file "$ENV_FILE" \
  --profile tools run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  --email "$LETSENCRYPT_EMAIL" \
  --agree-tos --no-eff-email \
  "${DOMAINS[@]}" \
  --cert-name "$CERT_NAME"

echo "==> Enable SSL in $ENV_FILE: SSL_ENABLED=true"
echo "==> Then run: docker compose -f docker-compose.prod.yml -f docker-compose.ssl.yml up -d"
