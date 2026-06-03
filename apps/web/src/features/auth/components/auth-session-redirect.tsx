'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuthHydrated } from '@/features/auth/hooks/use-auth-hydrated';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useSessionRestoreStatus } from '@/features/auth/context/session-restore-context';
import { syncAuthCookieFromStore } from '@/features/auth/model/auth-store';
import { resolvePostLoginPath } from '@/shared/routing/safe-redirect';

/**
 * Sends already-signed-in users away from /login. Only trusts Zustand session
 * (not a stale cookie) to avoid /login ↔ /checkout redirect loops.
 */
export function AuthSessionRedirect() {
  const searchParams = useSearchParams();
  const next = searchParams.get('next');
  const hydrated = useAuthHydrated();
  const restoreStatus = useSessionRestoreStatus();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!hydrated || restoreStatus === 'restoring') {
      return;
    }

    if (isAuthenticated) {
      syncAuthCookieFromStore();
      window.location.replace(resolvePostLoginPath(next));
    }
  }, [hydrated, restoreStatus, isAuthenticated, next]);

  return null;
}
