FROM node:22-bookworm-slim

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/config/package.json packages/config/package.json
COPY packages/contracts/package.json packages/contracts/package.json

COPY apps/api apps/api
COPY packages packages

RUN pnpm install --frozen-lockfile

ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sadaf_gold?schema=public"
ENV DIRECT_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sadaf_gold?schema=public"

RUN pnpm --filter @gold/config build \
  && pnpm --filter @gold/contracts build \
  && pnpm --filter @gold/api prisma:generate \
  && pnpm --filter @gold/api build

WORKDIR /app/apps/api

EXPOSE 4000

CMD ["pnpm", "start:prod"]
