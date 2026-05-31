FROM node:22-bookworm-slim AS base
ENV PNPM_HOME="/pnpm" PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/
COPY packages/shared/package.json packages/shared/
COPY packages/types/package.json packages/types/
COPY packages/ui/package.json packages/ui/
COPY packages/api-client/package.json packages/api-client/
RUN pnpm install --frozen-lockfile

FROM deps AS build
ARG NEXT_PUBLIC_API_BASE_URL=https://api.sadafgold.com/api/v1
ARG NEXT_PUBLIC_WS_BASE_URL=https://api.sadafgold.com
ARG NEXT_PUBLIC_APP_NAME=Sadaf Gold
ARG NEXT_PUBLIC_GOLD_TRADE_COMMISSION_PERCENT=0.5
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_WS_BASE_URL=$NEXT_PUBLIC_WS_BASE_URL
ENV NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME
ENV NEXT_PUBLIC_GOLD_TRADE_COMMISSION_PERCENT=$NEXT_PUBLIC_GOLD_TRADE_COMMISSION_PERCENT
COPY tsconfig.base.json turbo.json ./
COPY apps/web apps/web
COPY packages/shared packages/shared
COPY packages/types packages/types
COPY packages/ui packages/ui
COPY packages/api-client packages/api-client
RUN pnpm --filter @sadafgold/types build \
  && pnpm --filter @sadafgold/shared build \
  && pnpm --filter @sadafgold/api-client build \
  && pnpm --filter @sadafgold/ui build \
  && pnpm --filter @sadafgold/web build

FROM base AS runner
RUN groupadd --gid 1001 nodejs && useradd --uid 1001 --gid nodejs --shell /bin/bash --create-home nextjs
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
COPY --from=build /app /app
RUN chown -R nextjs:nodejs /app
WORKDIR /app/apps/web
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=45s \
  CMD node -e "require('http').get('http://127.0.0.1:3000',r=>process.exit(r.statusCode<500?0:1)).on('error',()=>process.exit(1))"
CMD ["pnpm", "start"]
