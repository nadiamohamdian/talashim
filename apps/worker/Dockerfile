FROM node:22-bookworm-slim

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps/worker/package.json apps/worker/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/types/package.json packages/types/package.json

COPY apps/worker apps/worker
COPY packages packages

RUN pnpm install --frozen-lockfile

RUN pnpm --filter @gold/shared build \
  && pnpm --filter @gold/types build \
  && pnpm --filter @gold/worker build

WORKDIR /app/apps/worker

CMD ["node", "dist/main.js"]
