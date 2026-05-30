# Sadaf Gold — Turborepo Monorepo

This repository is a production-oriented Turborepo for Sadaf Gold, a luxury gold
trading platform. The workspace is organized by clear app boundaries and a
small set of shared packages for UI, types, and utilities.

Workspace layout
- `apps/web` — Next.js App Router storefront (public site)
- `apps/admin` — Next.js App Router admin dashboard
- `apps/api` — NestJS HTTP API (REST / Swagger / validation ready)
- `apps/worker` — NestJS background worker (queues / cron / jobs)
- `packages/ui` — Shared React UI primitives
- `packages/types` — Shared TypeScript contracts and interfaces (`@gold/types`)
- `packages/shared` — Env schemas, platform constants, and pure helpers (`@gold/shared`)
- `packages/eslint-config` — Central ESLint presets (`@gold/eslint-config`)
- `packages/tsconfig` — Central TS presets (`@gold/tsconfig`)

Key commands (root)
- `pnpm dev` — run development tasks in parallel via Turbo
- `pnpm build` — build all packages/apps via Turbo
- `pnpm lint` — run linters across the monorepo
- `pnpm typecheck` — TypeScript checks across the monorepo
- `pnpm --filter @gold/web dev` — run storefront locally

Notes
- Uses `pnpm` workspaces and `turbo` for fast monorepo tasks.
- TypeScript is configured for strict mode; apps extend shared `packages/tsconfig` presets.
- ESLint is centralized in `packages/eslint-config` and consumed by apps.
- Husky + lint-staged + commitlint are configured at the repository root.
- Dockerfiles and `docker-compose.yml` are provided for a production-like local
	environment (postgres, redis, api, web, admin, worker).

Environment
- Copy `.env.example` to `.env` and fill secrets before running containers.

If you need help running or extending the monorepo, ask for a targeted next step.
