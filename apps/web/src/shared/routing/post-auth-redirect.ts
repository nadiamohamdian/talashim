import type { AuthSession } from '@sadafgold/types';
import { needsAccountSetup } from '@talashim/shared/auth/map-session';
import { PROFILE_ONBOARDING_PATH } from './routes.config';
import { getSafeRedirectPath, resolvePostLoginPath } from './safe-redirect';

export function resolvePostAuthPath(
  session: AuthSession,
  next?: string | null,
): string {
  if (needsAccountSetup(session.user)) {
    return PROFILE_ONBOARDING_PATH;
  }
  return resolvePostLoginPath(next);
}

export function resolvePostAuthPathFromUser(
  user: AuthSession['user'],
  next?: string | null,
): string {
  if (needsAccountSetup(user)) {
    return PROFILE_ONBOARDING_PATH;
  }
  return resolvePostLoginPath(next);
}
