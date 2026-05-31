# Backend API Requirements — Admin Panel

All admin routes should use prefix **`/api/v1/admin`** (or nested `admin/...`), **`JwtAuthGuard`** + **`AdminRoleGuard`** (`Role.ADMIN`), Swagger documented, paginated list responses matching `PaginatedResponse<T>` from `@sadafgold/types`.

## Currently available (connected in admin UI)

| Method | Path                                   | Used by                                |
| ------ | -------------------------------------- | -------------------------------------- |
| GET    | `/admin/analytics`                     | Dashboard                              |
| GET    | `/admin/users`                         | Users list                             |
| PATCH  | `/admin/users/:userId/role`            | Role toggle                            |
| GET    | `/admin/kyc`                           | KYC queue                              |
| PATCH  | `/admin/kyc/:id/review`                | KYC approve/reject                     |
| GET    | `/admin/transactions/wallet`           | Finance / trading monitor              |
| GET    | `/admin/transactions/trades`           | Trading pages                          |
| GET    | `/admin/wallets`                       | Finance wallets                        |
| GET    | `/admin/audit-logs`                    | Security audit                         |
| GET    | `/catalog` (+ `/:slug`, `/categories`) | Products (read-only)                   |
| GET    | `/pricing/live`, `/pricing/history`    | Pricing                                |
| POST   | `/pricing/refresh`                     | Pricing refresh (should move to admin) |
| GET    | `/blog`                                | CMS blog list (read-only)              |

## P0 — Required for core admin operations

### Products (`admin/products`)

- `GET /admin/products` — paginated, filters (status, category, SKU)
- `GET /admin/products/:id` — full admin DTO (gallery, variants, SEO, wage, tax)
- `POST /admin/products` — create
- `PATCH /admin/products/:id` — update
- `DELETE /admin/products/:id` — soft delete
- `PATCH /admin/products/:id/status` — draft/active/archived
- `POST /admin/products/:id/images` — gallery upload

Fields: SKU, title, slug, description, images, weight, purity, wage, tax, inventory, live price, final price, category, SEO metadata, variants.

### Orders (`admin/orders`)

- `GET /admin/orders` — list with status, date, user filters
- `GET /admin/orders/:id` — detail + line items + payments
- `PATCH /admin/orders/:id/status` — state machine
- `GET /admin/orders/:id/invoice`
- `POST /admin/orders/:id/refunds`
- `PATCH /admin/orders/:id/shipment`

### Inventory (`admin/inventory`)

- `GET /admin/inventory` — stock overview
- `POST /admin/inventory/adjustments` — audited adjustments
- `GET /admin/inventory/history`
- `GET /admin/inventory/reports`

### Users (`admin/users` extensions)

- `GET /admin/users/:id` — profile + wallet summary
- `GET /admin/users/:id/activity` — audit timeline

### Notifications (`admin/notifications`)

- `GET /admin/notifications`
- `PATCH /admin/notifications/:id/read`

## P1 — Finance & reporting

### Ledger (internal service today — no REST)

- `GET /admin/ledger/entries` — double-entry journal, filters
- `GET /admin/accounting/records`
- `GET /admin/reports/financial` — P&L, balances, export

### Reports (`admin/reports`)

- `GET /admin/reports/sales?from&to`
- `GET /admin/reports/inventory`
- `GET /admin/reports/users`
- `GET /admin/reports/trading`
- `GET /admin/reports/vendors` (after marketplace)

Extend `GET /admin/analytics` with: revenue, sales volume, order counts, inventory summary, user/vendor growth time series.

## P1 — Pricing admin

- `GET /admin/pricing/providers`
- `PATCH /admin/pricing/margins`
- `PATCH /admin/pricing/commissions`
- `POST /admin/pricing/overrides`
- Move `POST /pricing/refresh` and `DELETE /market/cache` behind `AdminRoleGuard`

## P1 — CMS (`admin/cms`, `admin/blog`)

- Homepage blocks CRUD
- Banners CRUD
- `POST/PATCH/DELETE /admin/blog`
- FAQ CRUD
- Static pages CRUD
- `PATCH /admin/cms/seo` — global SEO

## P2 — Marketplace / vendors

Prisma: `Vendor`, `VendorApplication`, `VendorProduct`, `VendorWallet`, roles `VENDOR`, `VENDOR_ADMIN`.

- `GET /admin/vendors`
- `GET /admin/vendors/applications`
- `PATCH /admin/vendors/:id/approve`
- `PATCH /admin/vendors/:id/verify`
- `GET /admin/vendors/:id/products`
- `GET /admin/vendors/:id/reports`
- `GET /admin/vendors/:id/wallet`

## P2 — Trading settlement

- `GET /admin/trading/settlements`
- `PATCH /admin/trading/settlements/:id`

## P2 — Security

- `GET /admin/sessions` — admin device sessions
- `DELETE /admin/sessions/:id`
- `GET /admin/login-history`
- `GET/POST /admin/roles` — custom roles beyond CUSTOMER/ADMIN
- `GET /admin/permissions`
- `PATCH /admin/users/:id/permissions`

## Implementation notes

- Use DTOs + class-validator; mirror types in `packages/types`
- All write operations → audit log entry
- Financial writes → transactional + ledger entries
- Consistent error shape via global exception filter
- Rate limit admin mutation endpoints
