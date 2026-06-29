export const WEB_ACCESS_TOKEN_COOKIE = 'sg-access-token';
export const ADMIN_ACCESS_TOKEN_COOKIE = 'sg-admin-access-token';

/** Web storefront session — auto logout after 5 hours. */
export const WEB_SESSION_MAX_AGE_SEC = 5 * 60 * 60;

const DEFAULT_MAX_AGE_SEC = WEB_SESSION_MAX_AGE_SEC;

export function setAccessTokenCookie(name: string, token: string, maxAgeSec = DEFAULT_MAX_AGE_SEC) {
  if (typeof document === 'undefined') {
    return;
  }
  document.cookie = `${name}=${token}; path=/; max-age=${maxAgeSec}; SameSite=Lax`;
}

export function clearAccessTokenCookie(name: string) {
  if (typeof document === 'undefined') {
    return;
  }
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}
