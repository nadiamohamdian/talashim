'use client';

import type { ReactNode } from 'react';
import type { AdminPermissionKey } from '@/shared/config/admin-permissions';
import { useAdminAuthHydrated } from '../hooks/use-admin-auth-hydrated';
import { useAdminAuthStore } from '../model/admin-auth-store';

interface PermissionGateProps {
  permission: AdminPermissionKey;
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGate({ permission, children, fallback = null }: PermissionGateProps) {
  const hydrated = useAdminAuthHydrated();
  const allowed = useAdminAuthStore((s) => s.hasPermission(permission));

  if (!hydrated) {
    return null;
  }

  if (!allowed) return <>{fallback}</>;
  return <>{children}</>;
}
