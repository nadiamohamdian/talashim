#!/usr/bin/env bash
# Production deploy — run on the server from the repository root.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

ENV_FILE="${ENV_FILE:-.env.production}"
COMPOSE_FILES="-f docker-compose.prod.yml"
IMAGE_TAG="${IMAGE_TAG:-latest}"
export IMAGE_TAG ENV_FILE

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE — copy from .env.production.example" >&2
  exit 1
fi

# shellcheck disable=SC1090
set -a
source "$ENV_FILE"
set +a

if [[ "${SSL_ENABLED:-false}" == "true" ]]; then
  COMPOSE_FILES="$COMPOSE_FILES -f docker-compose.ssl.yml"
fi

echo "==> Pulling images (tag: $IMAGE_TAG)..."
docker compose $COMPOSE_FILES --env-file "$ENV_FILE" pull --ignore-pull-failures 2>/dev/null || true

echo "==> Building & starting stack..."
docker compose $COMPOSE_FILES --env-file "$ENV_FILE" up -d --build --remove-orphans

echo "==> Waiting for health checks..."
sleep 10
"$ROOT_DIR/scripts/health-check.sh" || {
  echo "Health check failed — recent logs:" >&2
  docker compose $COMPOSE_FILES --env-file "$ENV_FILE" logs --tail=80 api nginx
  exit 1
}

echo "==> Deploy complete."
