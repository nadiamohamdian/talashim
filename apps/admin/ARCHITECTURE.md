# Talashim Admin — Architecture

Enterprise admin panel as a **standalone Next.js app** (`apps/admin`, port **3002**). Production: `admin.talashim.com`.

## Principles

- Feature-based modules under `src/features/*`
- Shared shell & navigation under `src/widgets/admin`
- Typed HTTP layer under `src/lib/api`
- **No mock dashboards** — live data from NestJS or explicit API requirement panels
- Dark-first luxury UI (gold `#c4a265`, zinc surfaces)

## Folder structure

```
apps/admin/src/
├── app/
│   ├── layout.tsx              # Root, dark RTL
│   ├── login/
│   └── (dashboard)/            # All authenticated routes
│       ├── page.tsx              # Dashboard (analytics + pricing + audit)
│       ├── products/ ...
│       ├── inventory/ ...
│       ├── orders/ ...
│       ├── users/ ...
│       ├── vendors/ ...          # Marketplace-ready placeholders
│       ├── trading/ ...
│       ├── pricing/ ...
│       ├── finance/ ...
│       ├── cms/ ...
│       ├── reports/ ...
│       ├── security/ ...
│       └── notifications/
├── features/                     # Domain UI + logic
│   ├── admin/api/                # Admin REST client
│   ├── auth/                     # Admin session (sg-admin-access-token)
│   ├── dashboard/
│   ├── products/
│   ├── pricing/
│   ├── trading/
│   ├── users/
│   ├── finance/
│   ├── cms/
│   ├── security/
│   └── vendors/
├── widgets/admin/                # Shell, sidebar, page chrome
├── lib/api/                      # Catalog, pricing, blog clients
└── shared/config/                # Navigation IA, API requirements registry
```

## Route map (information architecture)

| Section   | Routes                                                                      | API status                            |
| --------- | --------------------------------------------------------------------------- | ------------------------------------- |
| Overview  | `/`, `/notifications`                                                       | Analytics live; notifications pending |
| Products  | `/products`, `/products/new`, `/products/[slug]`, `.../edit`                | Catalog read live; CRUD pending       |
| Inventory | `/inventory`, `.../adjustments`, `.../history`, `.../reports`               | Pending                               |
| Orders    | `/orders`, `/orders/[id]`                                                   | Pending                               |
| Users     | `/users`, `/users/kyc`, `/users/roles`, `/users/permissions`, `/users/[id]` | Users + KYC live                      |
| Vendors   | `/vendors`, `/vendors/applications`, …                                      | Pending (architecture ready)          |
| Trading   | `/trading/buy-orders`, `sell-orders`, `history`, `settlement`, `reports`    | Trades monitor live                   |
| Pricing   | `/pricing/live`, `history`, `providers`, …                                  | Live/history public API               |
| Finance   | `/finance/wallets`, `transactions`, `ledger`, …                             | Wallets + tx live                     |
| CMS       | `/cms/blog`, `homepage`, …                                                  | Blog read live                        |
| Reports   | `/reports/*`                                                                | Pending                               |
| Security  | `/security/audit`, `sessions`, …                                            | Audit live                            |

Legacy redirects: `/kyc` → `/users/kyc`, `/wallets` → `/finance/wallets`, etc.

## Auth

- Cookie: `sg-admin-access-token` (isolated from retail `sg-access-token`)
- `POST /auth/login` + client admin role check + `AdminRoleGuard` on `/admin/*`
- Middleware protects all routes except `/login`

## Navigation

Single config: `shared/config/admin-navigation.ts` — drives sidebar sections and mobile nav. Dot colors: green = live API, amber = partial, gray = pending.

## Adding a new module

1. Add endpoints to `BACKEND_API_REQUIREMENTS.md` and `shared/config/api-requirements.ts`
2. Add nav item in `admin-navigation.ts`
3. Create `features/<module>/` components
4. Add `app/(dashboard)/<module>/page.tsx`
5. Wire React Query in `lib/api` when backend ships
