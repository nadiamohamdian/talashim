export const WEB_ACCESS_TOKEN_COOKIE = 'sg-access-token';
export const ADMIN_ACCESS_TOKEN_COOKIE = 'sg-admin-access-token';

const DEFAULT_MAX_AGE_SEC = 60 * 60 * 24 * 7;

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
