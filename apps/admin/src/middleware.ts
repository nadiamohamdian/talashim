import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_COOKIE = 'sg-admin-access-token';

/** Dashboard routes only — not a global catch-all. */
const PROTECTED_PREFIXES = [
  '/',
  '/users',
  '/kyc',
  '/transactions',
  '/wallets',
  '/audit',
] as const;

function isProtectedAdminPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  const { pathname } = request.nextUrl;
  const isLogin = pathname === '/login' || pathname.startsWith('/login/');

  if (isProtectedAdminPath(pathname) && !isLogin && !token) {
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('next', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  if (token && isLogin) {
    const next = request.nextUrl.searchParams.get('next');
    const destination = next?.startsWith('/') ? next : '/';
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/login/:path*',
    '/users/:path*',
    '/kyc/:path*',
    '/transactions/:path*',
    '/wallets/:path*',
    '/audit/:path*',
  ],
};
