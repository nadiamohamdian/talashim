'use client';

import { useEffect, type PropsWithChildren } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { buildLoginHref } from '@/shared/routing/safe-redirect';
import { clearAuthCookie } from '@/features/auth/api/auth-api';
import { hasValidAuthCookie } from '@/features/auth/lib/auth-cookie';
import { useAuthHydrated } from '@/features/auth/hooks/use-auth-hydrated';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useSessionRestoreStatus } from '@/features/auth/context/session-restore-context';
import { syncAuthCookieFromStore, useAuthStore } from '@/features/auth/model/auth-store';

/**
 * Client-side safety net when the session expires while on a protected page.
 * Initial access is enforced by middleware (cookie); this handles SPA navigation.
 */
export function ProtectedShell({ children }: PropsWithChildren) {
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useAuthHydrated();
  const restoreStatus = useSessionRestoreStatus();
  const { isAuthenticated } = useAuth();
  const restoring = restoreStatus === 'restoring';

  useEffect(() => {
    if (hydrated && !restoring) {
      syncAuthCookieFromStore();
    }
  }, [hydrated, restoring]);

  useEffect(() => {
    if (!hydrated || restoring || isAuthenticated) {
      return;
    }

    const returnPath = `${pathname}${window.location.search}`;
    const loginHref = buildLoginHref(returnPath);

    if (hasValidAuthCookie()) {
      clearAuthCookie();
      useAuthStore.getState().clearSession();
      window.location.replace(loginHref);
      return;
    }

    router.replace(loginHref);
  }, [isAuthenticated, hydrated, restoring, pathname, router]);

  if (!hydrated || restoring || !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
