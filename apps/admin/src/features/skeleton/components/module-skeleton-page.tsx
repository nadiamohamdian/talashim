'use client';

import { notFound } from 'next/navigation';
import { ADMIN_ROUTE_BY_ID } from '@/shared/config/admin-routes';
import { DetailPageTemplate } from '@/widgets/admin/templates/detail-page-template';
import { ListPageTemplate } from '@/widgets/admin/templates/list-page-template';
import { SettingsPageTemplate } from '@/widgets/admin/templates/settings-page-template';
import { DashboardShell } from '@/features/dashboard/components/dashboard-shell';
import { AdminPageTemplate } from '@/widgets/admin/templates/admin-page-template';
import { PlaceholderPanel } from '@/widgets/admin/templates/placeholder-panel';

interface ModuleSkeletonPageProps {
  routeId: string;
}

export function ModuleSkeletonPage({ routeId }: ModuleSkeletonPageProps) {
  const route = ADMIN_ROUTE_BY_ID[routeId];
  if (!route) {
    notFound();
  }

  switch (route.template) {
    case 'dashboard':
      return <DashboardShell route={route} />;
    case 'list':
      return <ListPageTemplate route={route} />;
    case 'detail':
      return <DetailPageTemplate route={route} />;
    case 'settings':
      return <SettingsPageTemplate route={route} />;
    case 'blank':
      return (
        <AdminPageTemplate route={route}>
          <PlaceholderPanel template="blank" moduleLabel={route.label} />
        </AdminPageTemplate>
      );
    default:
      return <ListPageTemplate route={route} />;
  }
}
