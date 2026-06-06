# Dev / seed accounts

Run after Postgres is up:

```bash
pnpm --filter @sadafgold/api prisma:seed
```

Smoke-test login + role-scoped APIs (API must be running on port 4000):

```bash
pnpm --filter @sadafgold/api smoke:roles
```

## Staff (admin panel — `http://localhost:3002`)

| Role | Email | Password | Typical access |
|------|-------|----------|----------------|
| `SUPER_ADMIN` | `admin@talashim.local` | `Admin12345!` | Full panel |
| `SUPPORT` | `support@talashim.local` | `Admin12345!` | Users, KYC, orders, tickets |
| `ACCOUNTANT` | `accountant@talashim.local` | `Admin12345!` | Dashboard, products (read), orders (read) |
| `EDITOR` | `editor@talashim.local` | `Admin12345!` | CMS, products, media |
| `WAREHOUSE` | `warehouse@talashim.local` | `Admin12345!` | Orders, shipping, inventory |

Login: email + password on the admin login page.

## Customer (storefront — `http://localhost:3000`)

| Field | Value |
|-------|--------|
| Email | `customer@talashim.local` |
| Password | `Customer12345!` |
| Mobile (OTP) | `09121234567` |

- **Password login:** email + `Customer12345!`
- **OTP login:** use mobile `09121234567` or email `customer@talashim.local`
- In development, OTP is logged in the API console (`OTP for …: ######`) when `WEB_DEV_LOGIN` is not `false`.

Checkout (`/checkout`) requires a valid storefront session (cookie `sg-access-token`).

## Environment

- `WEB_DEV_LOGIN` — dev OTP bypass / auto-create customer (default on in non-production)
- `ADMIN_DEV_LOGIN` — dev staff login helpers (default on in non-production)
