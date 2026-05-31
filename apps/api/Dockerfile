FROM node:22-bookworm-slim AS base
ENV PNPM_HOME="/pnpm" PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
COPY packages/types/package.json packages/types/
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY tsconfig.base.json turbo.json ./
COPY apps/api apps/api
COPY packages/shared packages/shared
COPY packages/types packages/types
ENV DATABASE_URL="postgresql://postgres:postgres@postgres:5432/sadaf_gold?schema=public"
ENV DIRECT_DATABASE_URL="postgresql://postgres:postgres@postgres:5432/sadaf_gold?schema=public"
RUN pnpm --filter @sadafgold/shared build \
  && pnpm --filter @sadafgold/types build \
  && pnpm --filter @sadafgold/api prisma:generate \
  && pnpm --filter @sadafgold/api build

FROM base AS runner
RUN apt-get update \
  && apt-get install -y --no-install-recommends curl \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd --gid 1001 nodejs \
  && useradd --uid 1001 --gid nodejs --shell /bin/bash --create-home nestjs
ENV NODE_ENV=production
COPY --from=build /app /app
COPY docker/api/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh \
  && chown -R nestjs:nodejs /app
WORKDIR /app/apps/api
USER nestjs
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=60s \
  CMD curl -f http://localhost:4000/api/v1/health || exit 1
ENTRYPOINT ["docker-entrypoint.sh"]
