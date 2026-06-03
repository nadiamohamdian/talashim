import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/shared/routing/routes.config';
import { isProtectedPath } from '@/shared/routing/path-matcher';
import { buildLoginUrl } from '@/shared/routing/safe-redirect';
import { isLikelyAccessToken } from '@/shared/routing/auth-token';

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const hasAccessCookie = isLikelyAccessToken(token);

  // Only gate checkout — never redirect away from /login based on cookie alone.
  // Stale JWT-shaped cookies caused /login ↔ /checkout loops; client restores or
  // clears the session via LoginSessionGuard / ProtectedShell.
  if (isProtectedPath(pathname) && !hasAccessCookie) {
    const returnPath = `${pathname}${search}`;
    return NextResponse.redirect(buildLoginUrl(request.url, returnPath));
  }

  return NextResponse.next();
}

/** Login enforced only at checkout (+ auth pages for signed-in redirect). */
export const config = {
  matcher: ['/checkout', '/checkout/:path*', '/login', '/login/:path*'],
};
