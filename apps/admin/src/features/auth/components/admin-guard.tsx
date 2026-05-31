'use client';

import { useEffect, type PropsWithChildren } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuthHydrated } from '../hooks/use-admin-auth-hydrated';
import { useAdminAuthStore } from '../model/admin-auth-store';
import { AdminAuthBootScreen } from './admin-auth-boot-screen';

export function AdminGuard({ children }: PropsWithChildren) {
  const router = useRouter();
  const hydrated = useAdminAuthHydrated();
  const isAdmin = useAdminAuthStore((s) => s.isAdmin());

  useEffect(() => {
    if (hydrated && !isAdmin) {
      router.replace('/login');
    }
  }, [hydrated, isAdmin, router]);

  if (!hydrated || !isAdmin) {
    return <AdminAuthBootScreen />;
  }

  return <>{children}</>;
}
