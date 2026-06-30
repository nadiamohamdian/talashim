'use client';

import { useEffect, type PropsWithChildren } from 'react';
import { useSearchParams } from 'next/navigation';
import { needsAccountSetup } from '@talashim/shared/auth/map-session';
import { useAuthHydrated } from '@/features/auth/hooks/use-auth-hydrated';
import { useAuth } from '@/features/auth/hooks/use-auth';
import {
  useSessionRestoreStatus,
  useSessionVerified,
} from '@/features/auth/context/session-restore-context';
import { syncAuthCookieFromStore } from '@/features/auth/model/auth-store';
import { resolvePostAuthPathFromUser } from '@/shared/routing/post-auth-redirect';

/**
 * Setup page requires an authenticated session that still needs onboarding.
 */
export function AccountSetupSessionGuard({ children }: PropsWithChildren) {
  const searchParams = useSearchParams();
  const next = searchParams.get('next');
  const hydrated = useAuthHydrated();
  const restoreStatus = useSessionRestoreStatus();
  const sessionVerified = useSessionVerified();
  const { isAuthenticated, user } = useAuth();
  const restoring = restoreStatus === 'restoring';

  useEffect(() => {
    if (!hydrated || restoring) {
      return;
    }

    if (isAuthenticated && sessionVerified && user && !needsAccountSetup(user)) {
      syncAuthCookieFromStore();
      window.location.replace(resolvePostAuthPathFromUser(user, next));
    }
  }, [hydrated, restoring, isAuthenticated, sessionVerified, user, next]);

  if (!hydrated || restoring) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
