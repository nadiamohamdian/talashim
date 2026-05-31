import { DEFAULT_POST_LOGIN_PATH, LOGIN_PATH } from './routes.config';
import { isAuthPath } from './path-matcher';

/**
 * Prevents open redirects; only allows same-origin relative paths.
 */
export function getSafeRedirectPath(
  next: string | null | undefined,
  fallback: string = DEFAULT_POST_LOGIN_PATH,
): string {
  if (!next || typeof next !== 'string') {
    return fallback;
  }

  const trimmed = next.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return fallback;
  }

  try {
    const parsed = new URL(trimmed, 'http://local.invalid');
    const path = `${parsed.pathname}${parsed.search}`;

    if (isAuthPath(parsed.pathname)) {
      return fallback;
    }

    return path;
  } catch {
    return fallback;
  }
}

export function buildLoginUrl(requestUrl: string, returnPath: string): URL {
  const loginUrl = new URL(LOGIN_PATH, requestUrl);
  loginUrl.searchParams.set('next', getSafeRedirectPath(returnPath));
  return loginUrl;
}

/** Client-safe login href with return path. */
export function buildLoginHref(returnPath: string): string {
  const params = new URLSearchParams({
    next: getSafeRedirectPath(returnPath),
  });
  return `${LOGIN_PATH}?${params.toString()}`;
}

export function resolvePostLoginPath(next: string | null | undefined): string {
  return getSafeRedirectPath(next, DEFAULT_POST_LOGIN_PATH);
}
