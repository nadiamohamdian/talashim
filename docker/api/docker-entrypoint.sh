#!/bin/sh
set -eu

cd /app/apps/api

echo "[api] Running database migrations..."
pnpm prisma:migrate:deploy

echo "[api] Starting NestJS..."
exec pnpm start:prod
