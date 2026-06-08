import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ADMIN_ACCESS_TOKEN_COOKIE } from '@talashim/shared/constants/auth';

/** Legacy cookie from older admin builds — cleared on login routes to stop redirect loops. */
const LEGACY_ADMIN_COOKIE = 'talashim-admin-access-token';
const LOGIN_PATH = '/login';

const DEV_AUTH_BYPASS =
  process.env.NODE_ENV === 'development' &&
  process.env.ADMIN_MIDDLEWARE_AUTH !== 'true';

function isPublicPath(pathname: string): boolean {
  return pathname === LOGIN_PATH || pathname.startsWith(`${LOGIN_PATH}/`);
}

function isStaticAsset(pathname: string): boolean {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isStaticAsset(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
  const legacyToken = request.cookies.get(LEGACY_ADMIN_COOKIE)?.value;
  const isLogin = isPublicPath(pathname);

  if (legacyToken && isLogin) {
    const response = NextResponse.next();
    response.cookies.set(LEGACY_ADMIN_COOKIE, '', { path: '/', maxAge: 0 });
    return response;
  }

  if (!DEV_AUTH_BYPASS && !isLogin && !token) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('next', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // In dev, a stale cookie must not trap users on / (middleware bounce) away from /login.
  if (token && isLogin && !DEV_AUTH_BYPASS) {
    const next = request.nextUrl.searchParams.get('next');
    const destination = next?.startsWith('/') ? next : '/';
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
