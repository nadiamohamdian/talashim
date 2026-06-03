import { clearAccessTokenCookie } from '@talashim/shared/constants/auth';

const LEGACY_ADMIN_COOKIE = 'talashim-admin-access-token';

/** Removes stale cookie names that no longer match middleware / store. */
export function clearLegacyAdminAuthCookies() {
  clearAccessTokenCookie(LEGACY_ADMIN_COOKIE);
}
