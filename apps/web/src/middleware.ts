import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  AUTH_COOKIE_NAME,
  DEFAULT_POST_LOGIN_PATH,
} from '@/shared/routing/routes.config';
import { isAuthPath, isProtectedPath } from '@/shared/routing/path-matcher';
import { buildLoginUrl, getSafeRedirectPath } from '@/shared/routing/safe-redirect';

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const isAuthenticated = Boolean(token);

  if (isProtectedPath(pathname) && !isAuthenticated) {
    const returnPath = `${pathname}${search}`;
    return NextResponse.redirect(buildLoginUrl(request.url, returnPath));
  }

  if (isAuthenticated && isAuthPath(pathname)) {
    const nextParam = request.nextUrl.searchParams.get('next');
    const destination = getSafeRedirectPath(nextParam, DEFAULT_POST_LOGIN_PATH);
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return NextResponse.next();
}

/** Login enforced only at checkout (+ auth pages for signed-in redirect). */
export const config = {
  matcher: ['/checkout', '/checkout/:path*', '/login', '/login/:path*'],
};
