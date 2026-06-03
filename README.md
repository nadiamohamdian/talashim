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
- `packages/types` — Shared TypeScript contracts (`@sadafgold/types`)
- `packages/shared` — Env schemas, constants, helpers (`@sadafgold/shared`)
- `packages/eslint-config` — Central ESLint presets
- `packages/tsconfig` — Central TS presets

Key commands (root)
- `pnpm dev` — run development tasks in parallel via Turbo
- `pnpm build` — build all packages/apps via Turbo
- `pnpm lint` — run linters across the monorepo
- `pnpm typecheck` — TypeScript checks across the monorepo
- `pnpm --filter @sadafgold/web dev` — run storefront locally

Notes
- Uses `pnpm` workspaces and `turbo` for fast monorepo tasks.
- TypeScript is configured for strict mode; apps extend shared `packages/tsconfig` presets.
- ESLint is centralized in `packages/eslint-config` and consumed by apps.
- Husky + lint-staged + commitlint are configured at the repository root.
- Dockerfiles and `docker-compose.yml` are provided for a production-like local
	environment (postgres, redis, api, web, admin, worker).

Environment
- Copy `.env.example` to `.env` for local development.
- For Docker dev, copy `.env.docker.example` to `.env` and run `docker compose up --build`.
- Production: copy `.env.production.example` → `.env.production` on the server.

## Storefront

Public information architecture, product model, and page hierarchy: [docs/STOREFRONT_IA.md](docs/STOREFRONT_IA.md).

## Dev login accounts

Seed users per role (staff + customer) and passwords: [docs/DEV_ACCOUNTS.md](docs/DEV_ACCOUNTS.md).

## Production deployment

### Architecture

```
Internet → Nginx (:80/:443) → retail / wholesale / admin / api subdomains
                ↓
         api | web | admin | worker
                ↓
         postgres | redis | minio
```

| Subdomain | Service |
|-----------|---------|
| `retail.*` | Next.js storefront |
| `wholesale.*` | Next.js (same app; separate host) |
| `admin.*` | Admin dashboard |
| `api.*` | NestJS API (`/api/v1/health`, `/api/v1/metrics`) |

### Server setup (once)

```bash
sudo ./scripts/setup-server.sh
# Clone repo to /opt/sadafgold, copy .env.production, point DNS to the server
./scripts/deploy.sh
```

### TLS (Let's Encrypt)

```bash
# Stack running on port 80 with HTTP template
./scripts/ssl-init.sh
# Set SSL_ENABLED=true in .env.production, then:
pnpm docker:prod:ssl
```

Renewal: certbot sidecar (12h) or `./scripts/ssl-renew.sh`.

### Scripts

| Script | Purpose |
|--------|---------|
| `scripts/deploy.sh` | Pull/build, migrate, start, health-check |
| `scripts/health-check.sh` | Verify nginx + API routes |
| `scripts/ssl-init.sh` | First certificate |
| `scripts/ssl-renew.sh` | Manual renew + nginx reload |
| `scripts/rollback.sh` | Deploy previous `IMAGE_TAG` |
| `scripts/setup-server.sh` | Install Docker on Ubuntu |

### CI/CD (GitHub Actions)

| Workflow | Trigger |
|----------|---------|
| `ci.yml` | PR / push — lint, typecheck, test, build |
| `docker-publish.yml` | Push to `main` — images to `ghcr.io/<owner>/sadafgold-*` |
| `deploy.yml` | Manual — SSH deploy |

**Deploy secrets:** `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`, `DEPLOY_PATH`, `GHCR_DEPLOY_TOKEN` (read packages).

**Repository variables (optional):** `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_WS_BASE_URL`.

### Docker services

- `postgres`, `redis`, `minio` — infrastructure with persistent volumes and healthchecks
- `api`, `web`, `admin`, `worker` — application images (`restart: unless-stopped`, log rotation 20m×5)
- `nginx` — reverse proxy with subdomain templates
- `certbot` — renewal when SSL compose is active
