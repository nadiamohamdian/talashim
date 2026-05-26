FROM node:22-bookworm-slim

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/config/package.json packages/config/package.json
COPY packages/contracts/package.json packages/contracts/package.json
COPY packages/ui/package.json packages/ui/package.json

COPY apps/web apps/web
COPY packages packages

RUN pnpm install --frozen-lockfile

RUN pnpm --filter @gold/config build \
  && pnpm --filter @gold/contracts build \
  && pnpm --filter @gold/ui build \
  && pnpm --filter @gold/web build

WORKDIR /app/apps/web

EXPOSE 3000

CMD ["pnpm", "start"]
