'use client';

import type { ReactNode } from 'react';
import type { AdminRouteDefinition } from '@/shared/config/admin-routes';
import { RoutePermissionGuard } from '@/features/auth/components/route-permission-guard';
import { getSectionIcon } from '@/shared/lib/admin-nav-icons';
import { getSectionTheme } from '@/shared/lib/admin-section-theme';
import { PageHeader } from '../page-header';

interface AdminPageTemplateProps {
  route: AdminRouteDefinition;
  children?: ReactNode;
  actions?: ReactNode;
}

export function AdminPageTemplate({ route, children, actions }: AdminPageTemplateProps) {
  const SectionIcon = getSectionIcon(route.sectionId);
  const theme = getSectionTheme(route.sectionId);

  return (
    <RoutePermissionGuard permission={route.permission}>
      <div className="admin-page-stack">
        <PageHeader
          title={route.label}
          description={route.description ?? `ماژول ${route.sectionLabel} — اسکلت UI`}
          availability={route.availability}
          actions={actions}
          icon={SectionIcon}
          iconTheme={theme}
        />
        {children}
      </div>
    </RoutePermissionGuard>
  );
}
