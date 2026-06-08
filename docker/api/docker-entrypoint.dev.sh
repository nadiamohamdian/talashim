#!/bin/sh
set -eu

cd /app/apps/api

echo "[api] Generating Prisma client..."
pnpm prisma:generate

echo "[api] Running database migrations..."
pnpm prisma:migrate:deploy

echo "[api] Starting NestJS (watch mode)..."
exec pnpm start:dev
