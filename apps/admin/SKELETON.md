# Admin Panel Skeleton

Architecture-only UI shell (no business logic / API calls on module pages).

## Run

```bash
pnpm --filter @sadafgold/admin dev
# http://localhost:3002/login
```

## Structure

```
src/
├── shared/config/
│   ├── admin-routes.ts      # Route registry (nav, breadcrumbs, guards, templates)
│   ├── admin-navigation.ts  # Sidebar sections (derived from routes)
│   └── admin-permissions.ts # Permission keys + ALL_ADMIN_PERMISSIONS
├── shared/lib/
│   └── admin-route-resolver.ts  # match pathname → route, breadcrumbs
├── features/
│   ├── auth/                # AdminGuard, PermissionGate, RoutePermissionGuard, store
│   ├── dashboard/           # DashboardShell (KPI placeholders)
│   └── skeleton/            # ModuleSkeletonPage
├── widgets/admin/
│   ├── admin-shell.tsx      # Layout: sidebar + topbar + main
│   ├── admin-sidebar.tsx    # Permission-filtered nav
│   ├── admin-topbar.tsx     # Breadcrumbs
│   ├── admin-breadcrumbs.tsx
│   └── templates/           # list | detail | settings | placeholder
└── app/(dashboard)/         # One page.tsx per route → ModuleSkeletonPage
```

## Page templates

| Template    | Use                                |
| ----------- | ---------------------------------- |
| `dashboard` | `/` — KPI + chart placeholders     |
| `list`      | Tables — filter bar + content slot |
| `detail`    | Tabs + main/sidebar columns        |
| `settings`  | Settings nav + form area           |
| `blank`     | Custom layout (e.g. media upload)  |

## Guards

1. **Middleware** — `sg-admin-access-token` on all routes except `/login`
2. **AdminGuard** — client session + `role === admin`
3. **RoutePermissionGuard** — per-page `route.permission` (403 UI if missing)
4. **Sidebar** — items filtered by `hasPermission`

Until RBAC API exists, `ADMIN` role receives `ALL_ADMIN_PERMISSIONS`.

## Regenerate pages

After editing `admin-routes.ts`:

```bash
node scripts/generate-skeleton-pages.mjs
```

Legacy redirects preserved: `/kyc`, `/wallets`, `/transactions`, `/audit`.
