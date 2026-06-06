'use client';

import { useEffect, type PropsWithChildren } from 'react';
import { useRouter } from 'next/navigation';
import { fetchMyPermissions } from '@/features/admin/api/admin-api';
import type { AdminPermissionKey } from '@/shared/config/admin-permissions';
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
  const setPermissions = useAdminAuthStore((s) => s.setPermissions);

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

    fetchMyPermissions()
      .then((result) => {
        if (!cancelled) {
          setPermissions(result.permissions as AdminPermissionKey[]);
        }
      })
      .catch(() => {
        // Keep persisted/static permissions when sync fails (offline API).
      });

    return () => {
      cancelled = true;
    };
  }, [hydrated, isAdmin, setPermissions]);

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