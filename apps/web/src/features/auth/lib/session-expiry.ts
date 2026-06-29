/** Maximum authenticated session duration — 5 hours from login or restore. */
export const SESSION_MAX_AGE_MS = 5 * 60 * 60 * 1000;

export const SESSION_LOGIN_AT_KEY = 'sg-session-login-at';

function readLoginAt(): number | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = sessionStorage.getItem(SESSION_LOGIN_AT_KEY);
    if (!raw) {
      return null;
    }

    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function stampSessionLogin(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    sessionStorage.setItem(SESSION_LOGIN_AT_KEY, String(Date.now()));
  } catch {
    // Ignore quota / private mode errors.
  }
}

/** Preserves an existing login timestamp when restoring across navigations. */
export function stampSessionLoginIfMissing(): void {
  if (readLoginAt() === null) {
    stampSessionLogin();
  }
}

export function clearSessionLoginStamp(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    sessionStorage.removeItem(SESSION_LOGIN_AT_KEY);
  } catch {
    // Ignore quota / private mode errors.
  }
}

export function isSessionExpired(): boolean {
  const loginAt = readLoginAt();
  if (loginAt === null) {
    return false;
  }

  return Date.now() - loginAt >= SESSION_MAX_AGE_MS;
}

export function getSessionRemainingMs(): number | null {
  const loginAt = readLoginAt();
  if (loginAt === null) {
    return null;
  }

  return Math.max(0, SESSION_MAX_AGE_MS - (Date.now() - loginAt));
}
