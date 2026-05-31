'use client';

import { useEffect, type PropsWithChildren } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuthStore } from '../model/admin-auth-store';

export function AdminGuard({ children }: PropsWithChildren) {
  const router = useRouter();
  const isAdmin = useAdminAuthStore((s) => s.isAdmin());

  useEffect(() => {
    if (!isAdmin) {
      router.replace('/login');
    }
  }, [isAdmin, router]);

  if (!isAdmin) return null;
  return <>{children}</>;
}
