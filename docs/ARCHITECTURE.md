# Sadaf Gold — Architecture & Refactoring Guide

## Target layering

```
apps/
  web | admin     → presentation (Next.js features / widgets)
  api             → presentation (controllers) + application (services) + infrastructure
  worker          → application jobs (queues — planned)

packages/
  types           → cross-app contracts (no runtime)
  shared          → env Zod, pure domain helpers, validation
  api-client      → HTTP client factory (axios)
  ui              → design system + shared React providers
```

## Completed refactors

| Area | Change |
|------|--------|
| Trade quote | Single `computeTradeQuote()` in `@sadafgold/shared/trade-quote` |
| API errors | `parseApiErrorMessage()` + `@sadafgold/api-client` |
| Auth validation | Shared Zod schemas in `@sadafgold/shared/validation/auth` |
| Auth session | `mapApiAuthSession()` + cookie helpers |
| Types | `trading`, `admin`, `pagination` in `@sadafgold/types` |
| HTTP client | `createApiClient()` with injectable 401 handling |
| React Query | Shared `QueryProvider` in `@sadafgold/ui` |
| Health | `HealthService` (controller → service) |
| Admin auth | Middleware + access-token cookie parity with web |

## Recommended next steps (priority)

### P0 — Contract sync

1. **OpenAPI codegen** — Generate `@sadafgold/api-types` from `apps/api` Swagger to eliminate manual DTO ↔ frontend drift.
2. **Shared Zod from API** — Use `nestjs-zod` or export Zod from shared for request bodies used by both API and clients.

### P1 — API clean architecture

1. **Application layer** — Extract use cases from fat services (`TradingService`, `AdminService`).
2. **Domain module** — `packages/domain` with `Money`, `TradeQuote`, `GoldWeight` value objects (no Prisma imports).
3. **Repository interfaces** — `ITradingRepository` tokens for testability.

### P1 — Frontend

1. **`AdminDataTable` + `useAdminListQuery`** — DRY six dashboard pages under `apps/admin/src/app/(dashboard)/`.
2. **Remove deprecated** `apps/*/src/shared/providers/query-provider.ts` re-exports after import migration.
3. **Delete orphan** `packages/config/` if still present (superseded by `packages/shared`).

### P2 — Performance

1. Next.js `output: 'standalone'` in production Dockerfiles.
2. Service-level Redis cache in `CatalogService` / `BlogService` (HTTP cache is not enough for SSR).
3. Prisma query `select` projections on list endpoints.

### P2 — Security

1. Admin-only routes: dedicated `AdminAuthGuard` on `/admin/*` controllers (defense in depth).
2. OTP API endpoints if web OTP UI is enabled.
3. Rotate refresh tokens on use; device session table.

### P3 — Worker

1. BullMQ / Redis queue module in API + worker consumer.
2. Move pricing refresh scheduler to worker only.

## Folder conventions

| Layer | Web/Admin | API |
|-------|-----------|-----|
| Route / entry | `app/` | `modules/*/controllers/` |
| Feature logic | `features/<name>/` | `modules/<name>/services/` |
| Data access | `features/*/api/` | `modules/*/repositories/` |
| UI blocks | `widgets/` | — |
| Shared app code | `shared/` | `common/`, `infrastructure/` |

## Import rules

- Apps import packages only via `@sadafgold/*` — never cross-import `apps/web` ↔ `apps/admin`.
- Prefer package subpaths (`@sadafgold/shared/trade-quote`) for tree-shaking clarity.
- API must not import `@sadafgold/types` until DTOs are generated/shared intentionally.

## Validation strategy

| Layer | Tool |
|-------|------|
| API input | `class-validator` DTOs + global `ValidationPipe` |
| Env | Zod in `@sadafgold/shared/*-env` |
| Forms | Zod in `@sadafgold/shared/validation/*` |
| Future | Single schema source → generate class-validator + Zod |
