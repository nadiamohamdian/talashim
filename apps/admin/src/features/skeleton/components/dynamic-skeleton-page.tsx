'use client';

import { notFound } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { resolveAdminRoute } from '@/shared/lib/admin-route-resolver';
import { ModuleSkeletonPage } from './module-skeleton-page';

/** Resolves current pathname to route config — for dynamic segments. */
export function DynamicSkeletonPage() {
  const pathname = usePathname();
  const resolved = resolveAdminRoute(pathname);

  if (!resolved) {
    notFound();
  }

  return <ModuleSkeletonPage routeId={resolved.route.id} />;
}
