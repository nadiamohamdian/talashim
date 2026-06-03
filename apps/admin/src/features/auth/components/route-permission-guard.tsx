'use client';

import type { PropsWithChildren } from 'react';
import { Skeleton } from '@sadafgold/ui';
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
    return (
      <div className="space-y-6" aria-busy="true" aria-label="در حال بارگذاری">
        <Skeleton className="h-10 w-72 rounded-xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!allowed) {
    return <ForbiddenState permission={permission} />;
  }

  return <>{children}</>;
}
