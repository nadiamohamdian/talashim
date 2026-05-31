FROM node:22-bookworm-slim AS base
ENV PNPM_HOME="/pnpm" PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/worker/package.json apps/worker/
COPY packages/shared/package.json packages/shared/
COPY packages/types/package.json packages/types/
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY tsconfig.base.json ./
COPY apps/worker apps/worker
COPY packages/shared packages/shared
COPY packages/types packages/types
RUN pnpm --filter @sadafgold/shared build \
  && pnpm --filter @sadafgold/types build \
  && pnpm --filter @sadafgold/worker build

FROM base AS runner
RUN apt-get update \
  && apt-get install -y --no-install-recommends procps \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd --gid 1001 nodejs \
  && useradd --uid 1001 --gid nodejs --shell /bin/bash --create-home worker
ENV NODE_ENV=production
COPY --from=build /app /app
RUN chown -R worker:nodejs /app
WORKDIR /app/apps/worker
USER worker
HEALTHCHECK --interval=30s --timeout=5s --retries=3 --start-period=20s \
  CMD pgrep -f "node dist/main" >/dev/null || exit 1
CMD ["node", "dist/main.js"]
