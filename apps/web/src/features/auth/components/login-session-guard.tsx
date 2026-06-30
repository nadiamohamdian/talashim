'use client';

import { useEffect, type PropsWithChildren } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuthHydrated } from '@/features/auth/hooks/use-auth-hydrated';
import { useAuth } from '@/features/auth/hooks/use-auth';
import {
  useSessionRestoreStatus,
  useSessionVerified,
} from '@/features/auth/context/session-restore-context';
import { syncAuthCookieFromStore } from '@/features/auth/model/auth-store';
import { resolvePostAuthPathFromUser } from '@/shared/routing/post-auth-redirect';

/**
 * On /login: wait for session restore, then either show the form or redirect if signed in.
 */
export function LoginSessionGuard({ children }: PropsWithChildren) {
  const searchParams = useSearchParams();
  const next = searchParams.get('next');
  const hydrated = useAuthHydrated();
  const restoreStatus = useSessionRestoreStatus();
  const sessionVerified = useSessionVerified();
  const { isAuthenticated, user } = useAuth();
  const restoring = restoreStatus === 'restoring';
  const shouldRedirect = isAuthenticated && sessionVerified;

  useEffect(() => {
    if (!hydrated || restoring) {
      return;
    }

    if (shouldRedirect && user) {
      syncAuthCookieFromStore();
      window.location.replace(resolvePostAuthPathFromUser(user, next));
    }
  }, [hydrated, restoring, shouldRedirect, next, user]);

  if (!hydrated || restoring) {
    return null;
  }

  if (shouldRedirect) {
    return null;
  }

  return <>{children}</>;
}
