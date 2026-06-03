'use client';

import { useEffect, type PropsWithChildren } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuthHydrated } from '@/features/auth/hooks/use-auth-hydrated';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useSessionRestoreStatus } from '@/features/auth/context/session-restore-context';
import { syncAuthCookieFromStore } from '@/features/auth/model/auth-store';
import { resolvePostLoginPath } from '@/shared/routing/safe-redirect';
import { AuthBootScreen } from './auth-boot-screen';

/**
 * On /login: wait for session restore, then either show the form or redirect if signed in.
 */
export function LoginSessionGuard({ children }: PropsWithChildren) {
  const searchParams = useSearchParams();
  const next = searchParams.get('next');
  const hydrated = useAuthHydrated();
  const restoreStatus = useSessionRestoreStatus();
  const { isAuthenticated } = useAuth();
  const restoring = restoreStatus === 'restoring';

  useEffect(() => {
    if (!hydrated || restoring) {
      return;
    }

    if (isAuthenticated) {
      syncAuthCookieFromStore();
      window.location.replace(resolvePostLoginPath(next));
    }
  }, [hydrated, restoring, isAuthenticated, next]);

  if (!hydrated || restoring) {
    return <AuthBootScreen message="در حال بررسی وضعیت ورود..." />;
  }

  if (isAuthenticated) {
    return <AuthBootScreen message="در حال انتقال..." />;
  }

  return <>{children}</>;
}
