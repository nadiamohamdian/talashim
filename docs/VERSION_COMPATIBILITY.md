# Version Compatibility Report

**Audit date:** 2026-05-30  
**Monorepo:** sadaf-gold (pnpm 9.12.0, Turborepo)  
**Policy:** Latest stable production releases; single versions enforced via `pnpm-workspace.yaml` catalog + root `pnpm.overrides`.

---

## Executive summary

| Area | Status | Action taken |
|------|--------|--------------|
| Next.js | ✅ Compatible | Pinned `16.2.6` (latest stable) |
| React / React DOM | ⚠️ Was behind | Upgraded `19.2.4` → **`19.2.6`** (latest stable) |
| TypeScript | ✅ Compatible | Pinned **`6.0.3`** (latest stable; meets Next ≥5.1) |
| Tailwind CSS | ✅ Compatible | Aligned **`4.3.0`** + `@tailwindcss/postcss@4.3.0` |
| Workspace packages | ✅ Improved | pnpm **catalog** for shared deps |
| NestJS / Prisma | ✅ Compatible | Already on latest stable (`11.1.24` / `7.8.0`) |
| Husky | ⚠️ Was outdated | Upgraded **`8.x` → `9.1.7`**; `prepare` → `husky` |

---

## Core stack matrix

| Package | Required by | Minimum | Pinned (catalog) | Notes |
|---------|-------------|---------|------------------|-------|
| **Node.js** | Next 16 | 20.9.0+ | `engines.node >=20.9.0` | Node 18 unsupported |
| **Next.js** | web, admin | 16.x | **16.2.6** | Matches `eslint-config-next` |
| **React** | Next 16 App Router | 19.2+ | **19.2.6** | Must match `react-dom` |
| **React DOM** | Next 16 | 19.2+ | **19.2.6** | Override enforces single copy |
| **TypeScript** | All TS apps/packages | 5.1+ (Next) | **6.0.3** | `ignoreDeprecations: "6.0"` in base tsconfig |
| **Tailwind CSS** | web, admin | 4.x | **4.3.0** | v4 PostCSS plugin required |
| **@tailwindcss/postcss** | postcss.config | 4.x | **4.3.0** | Pair with `tailwindcss@4.3.0` |
| **@types/react** | Next apps | 19.x | **19.2.15** | Align with React 19.2 |
| **@types/react-dom** | Next apps | 19.x | **19.2.3** | Latest stable @types |

---

## Before → after (key changes)

| Package | Before | After | Reason |
|---------|--------|-------|--------|
| `react` | 19.2.4 (pinned) | **19.2.6** | Latest stable; security & Next 16.2 alignment |
| `react-dom` | 19.2.4 | **19.2.6** | Must match `react` exactly |
| `tailwindcss` (root) | `^4` (floating) | **4.3.0** | Avoid accidental major drift |
| `husky` | ^8.0.0 | **9.1.7** | Latest stable; v9 `prepare` script |
| `ts-node-dev` (worker) | `^2` (invalid range) | **2.0.0** | Explicit stable pin |
| `ts-jest` (api) | ^29.2.5 | **^29.4.11** | Better Jest 30 compatibility |
| `@sadafgold/ui` peers | `react: *` | **^19.2.0** | Prevents React 18 accidental install |
| Version source | Per-package scattered | **pnpm catalog** | Enterprise monorepo standard |

---

## Workspace package compatibility

| Package | Depends on | Compatible with |
|---------|------------|-----------------|
| `@sadafgold/types` | — | TS 6, no runtime |
| `@sadafgold/shared` | types, zod 4.4.3 | API, web, admin, worker |
| `@sadafgold/api-client` | shared, axios | web, admin (React 19) |
| `@sadafgold/ui` | react ^19.2, react-query ^5 | web, admin |
| `@sadafgold/eslint-config` | eslint 9, next 16 | All apps |

**Rule:** Frontend apps must not declare different `react` / `next` versions than the catalog. Root `pnpm.overrides` dedupes nested dependencies.

---

## Backend stack (unchanged — already stable)

| Package | Version | Status |
|---------|---------|--------|
| `@nestjs/common` | ^11.1.24 | ✅ Latest stable |
| `@prisma/client` / `prisma` | ^7.8.0 | ✅ Latest stable |
| `class-validator` | ^0.15.1 | ✅ Valid (not a typo) |
| `jest` | ^30.4.x | ✅ Latest major |
| `zod` | 4.4.3 (catalog) | ✅ Shared with frontends |

---

## Tailwind CSS v4 checklist

- [x] `@import "tailwindcss"` in `globals.css` (web)
- [x] `postcss.config.mjs` uses `@tailwindcss/postcss` only (no `tailwindcss` PostCSS plugin v3)
- [x] `tailwindcss@4.3.0` matches `@tailwindcss/postcss@4.3.0`
- [x] `tailwind-merge@3.x` compatible with Tailwind v4 utilities

---

## TypeScript 6 notes

- **Next.js 16** requires TypeScript **≥ 5.1** — TS 6.0.3 satisfies this.
- **NestJS 11** + **Prisma 7** resolve with TS 6 in lockfile (verified via existing `pnpm-lock.yaml`).
- **ts-jest** remains on **29.x** (no ts-jest 30); paired with **jest 30** per lockfile resolution.
- Transitive `typescript@5.9.3` is overridden to **6.0.3** at the root.

---

## Intentionally not upgraded

| Package | Current | Why |
|---------|---------|-----|
| `eslint-config-next` | 16.2.6 | Must match `next` major/minor |
| `socket.io` / `client` | ^4.8.1 | Stable; no conflict with React 19 |
| `recharts` | ^3.8.1 | React 19 compatible in v3.8+ |
| Nest / Prisma minors | ^11.1.24 / ^7.8.0 | Already at registry latest |

---

## How versions are managed

1. **`pnpm-workspace.yaml` → `catalog:`** — single source of truth for shared versions.
2. **`package.json` → `"dependency": "catalog:"`** — apps reference the catalog.
3. **`pnpm.overrides`** — forces `react`, `react-dom`, `typescript` across the tree.
4. **`engines`** — `node >=20.9.0`, `pnpm >=9.12.0`.

After pulling changes, run:

```bash
pnpm install
pnpm typecheck
pnpm build
```

---

## Risk register (monitor)

| Risk | Mitigation |
|------|------------|
| TS 6 ecosystem lag (older `@types/*`) | `skipLibCheck: true`; pin `@types/*` in catalog |
| Husky 9 hook migration | `prepare: "husky"`; verify `.husky/*` hooks still run |
| Jest 30 + ts-jest 29 combo | Run `pnpm --filter @sadafgold/api test` after install |
| Duplicate React copies | Root overrides + `pnpm why react` if runtime errors |

---

## Verification commands

```bash
pnpm why react
pnpm why react-dom
pnpm why typescript
pnpm why tailwindcss
pnpm list next react react-dom typescript tailwindcss --depth 0 -r
```

Expected: one version each for `react@19.2.6`, `react-dom@19.2.6`, `typescript@6.0.3`, `next@16.2.6` in web/admin.
