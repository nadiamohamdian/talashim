'use client';

import type { ReactNode } from 'react';
import type { AdminRouteDefinition } from '@/shared/config/admin-routes';
import { RoutePermissionGuard } from '@/features/auth/components/route-permission-guard';
import { PageHeader } from '../page-header';

interface AdminPageTemplateProps {
  route: AdminRouteDefinition;
  children?: ReactNode;
  actions?: ReactNode;
}

export function AdminPageTemplate({ route, children, actions }: AdminPageTemplateProps) {
  return (
    <RoutePermissionGuard permission={route.permission}>
      <div className="space-y-6">
        <PageHeader
          title={route.label}
          description={route.description ?? `ماژول ${route.sectionLabel} — اسکلت UI`}
          availability={route.availability}
          actions={actions}
        />
        {children}
      </div>
    </RoutePermissionGuard>
  );
}
