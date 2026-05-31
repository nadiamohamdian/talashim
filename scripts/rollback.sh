#!/usr/bin/env bash
# Roll back to a previous image tag (set IMAGE_TAG before running).
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

ENV_FILE="${ENV_FILE:-.env.production}"
IMAGE_TAG="${IMAGE_TAG:?Set IMAGE_TAG to the tag to roll back to (e.g. sha-abc123)}"

export IMAGE_TAG ENV_FILE
echo "==> Rolling back to IMAGE_TAG=$IMAGE_TAG"
"$ROOT_DIR/scripts/deploy.sh"
