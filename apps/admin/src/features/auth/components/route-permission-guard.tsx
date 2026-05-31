'use client';

import type { PropsWithChildren } from 'react';
import type { AdminPermissionKey } from '@/shared/config/admin-permissions';
import { ForbiddenState } from '@/widgets/admin/forbidden-state';
import { useAdminAuthHydrated } from '../hooks/use-admin-auth-hydrated';
import { useAdminAuthStore } from '../model/admin-auth-store';

interface RoutePermissionGuardProps extends PropsWithChildren {
  permission: AdminPermissionKey;
}

export function RoutePermissionGuard({ permission, children }: RoutePermissionGuardProps) {
  const hydrated = useAdminAuthHydrated();
  const allowed = useAdminAuthStore((s) => s.hasPermission(permission));

  if (!hydrated) {
    return null;
  }

  if (!allowed) {
    return <ForbiddenState permission={permission} />;
  }

  return <>{children}</>;
}
