#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ENV_FILE:-$ROOT_DIR/.env.production}"

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

API_DOMAIN="${API_DOMAIN:-api.sadafgold.com}"
RETAIL_DOMAIN="${RETAIL_DOMAIN:-retail.sadafgold.com}"
ADMIN_DOMAIN="${ADMIN_DOMAIN:-admin.sadafgold.com}"
NGINX_HTTP_PORT="${NGINX_HTTP_PORT:-80}"
SCHEME="http"
if [[ "${SSL_ENABLED:-false}" == "true" ]]; then
  SCHEME="https"
  NGINX_HTTP_PORT="${NGINX_HTTPS_PORT:-443}"
fi

BASE="${SCHEME}://127.0.0.1:${NGINX_HTTP_PORT}"
FAIL=0

check() {
  local name="$1"
  local url="$2"
  local host="$3"
  local code
  code="$(curl -sf -o /dev/null -w "%{http_code}" --connect-timeout 5 \
    -H "Host: ${host}" "${url}" 2>/dev/null || echo "000")"
  if [[ "$code" =~ ^(200|204|301|302|304)$ ]]; then
    echo "OK   $name ($code)"
  else
    echo "FAIL $name (HTTP $code) — $url" >&2
    FAIL=1
  fi
}

echo "==> Health checks via nginx ($BASE)"
check "API health" "${BASE}/api/v1/health" "$API_DOMAIN"
check "Retail" "${BASE}/" "$RETAIL_DOMAIN"
check "Admin" "${BASE}/" "$ADMIN_DOMAIN"

if docker compose -f "$ROOT_DIR/docker-compose.prod.yml" --env-file "$ENV_FILE" ps api 2>/dev/null | grep -q healthy; then
  echo "OK   Docker api container healthy"
else
  echo "WARN Docker api container not reported healthy (may still be starting)"
fi

exit "$FAIL"
