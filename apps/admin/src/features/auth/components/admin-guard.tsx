'use client';

import { useEffect, type PropsWithChildren } from 'react';
import { useRouter } from 'next/navigation';
import { syncAdminPermissionsFromApi } from '@/features/auth/lib/sync-admin-permissions';
import { useAdminAuthHydrated } from '../hooks/use-admin-auth-hydrated';
import {
  syncAdminAuthCookieFromStore,
  useAdminAuthStore,
} from '../model/admin-auth-store';
import { clearLegacyAdminAuthCookies } from '../lib/clear-legacy-admin-cookies';
import { AdminAuthBootScreen } from './admin-auth-boot-screen';

export function AdminGuard({ children }: PropsWithChildren) {
  const router = useRouter();
  const hydrated = useAdminAuthHydrated();
  const isAdmin = useAdminAuthStore((s) => s.isAdmin());
  useEffect(() => {
    if (hydrated) {
      syncAdminAuthCookieFromStore();
    }
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated || !isAdmin) {
      return;
    }

    let cancelled = false;

    const syncPermissions = () => {
      void syncAdminPermissionsFromApi();
    };

    syncPermissions();

    const onFocus = () => {
      if (!cancelled) {
        syncPermissions();
      }
    };

    window.addEventListener('focus', onFocus);

    return () => {
      cancelled = true;
      window.removeEventListener('focus', onFocus);
    };
  }, [hydrated, isAdmin]);

  useEffect(() => {
    if (!hydrated || isAdmin) {
      return;
    }
    clearLegacyAdminAuthCookies();
    useAdminAuthStore.getState().clearSession();
    router.replace('/login');
  }, [hydrated, isAdmin, router]);

  if (!hydrated) {
    return <AdminAuthBootScreen />;
  }

  if (!isAdmin) {
    return <AdminAuthBootScreen />;
  }

  return <>{children}</>;
}