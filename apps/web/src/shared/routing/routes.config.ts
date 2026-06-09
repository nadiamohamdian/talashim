/**
 * Canonical route policy for the retail storefront.
 * Guest browsing by default — middleware login only at checkout.
 */

/** Only checkout requires login (تسویه حساب). */
export const PROTECTED_ROUTE_PREFIXES = ['/checkout'] as const;

/** Member areas — optional login in UI, not middleware. */
export const MEMBER_ROUTE_PREFIXES = [
  '/account',
  '/dashboard',
  '/wallet',
  '/orders',
  '/invoices',
  '/trading',
  '/profile',
  '/kyc',
  '/addresses',
  '/b2b',
  '/wholesale',
] as const;

export const AUTH_ROUTE_PREFIXES = ['/login'] as const;

export const PUBLIC_ROUTE_PREFIXES = [
  '/',
  '/products',
  '/categories',
  '/search',
  '/prices',
  '/blog',
  '/faq',
  '/about',
  '/contact',
  '/terms',
  '/policies',
  '/pages',
  '/guides',
  ...MEMBER_ROUTE_PREFIXES,
] as const;

export const AUTH_COOKIE_NAME = 'sg-access-token';

export const LOGIN_PATH = '/login';

/** After login when `next` is absent. */
export const DEFAULT_POST_LOGIN_PATH = '/';
