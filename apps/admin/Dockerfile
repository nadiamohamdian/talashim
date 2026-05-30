FROM node:22-bookworm-slim

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps/admin/package.json apps/admin/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/types/package.json packages/types/package.json
COPY packages/ui/package.json packages/ui/package.json

COPY apps/admin apps/admin
COPY packages packages

RUN pnpm install --frozen-lockfile

RUN pnpm --filter @gold/shared build \
  && pnpm --filter @gold/types build \
  && pnpm --filter @gold/ui build \
  && pnpm --filter @gold/admin build

WORKDIR /app/apps/admin

EXPOSE 3001

CMD ["pnpm", "start"]
