import { AUTH_COOKIE_NAME } from '@/shared/routing/routes.config';
import { isLikelyAccessToken } from '@/shared/routing/auth-token';

export function readAuthCookieToken(): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const prefix = `${AUTH_COOKIE_NAME}=`;
  for (const part of document.cookie.split(';')) {
    const trimmed = part.trim();
    if (trimmed.startsWith(prefix)) {
      return trimmed.slice(prefix.length);
    }
  }
  return null;
}

export function hasValidAuthCookie(): boolean {
  return isLikelyAccessToken(readAuthCookieToken() ?? undefined);
}
