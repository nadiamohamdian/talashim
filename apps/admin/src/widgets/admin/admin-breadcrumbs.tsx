'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { buildBreadcrumbs, resolveAdminRoute } from '@/shared/lib/admin-route-resolver';

export function AdminBreadcrumbs() {
  const pathname = usePathname();
  const resolved = resolveAdminRoute(pathname);

  if (!resolved) {
    return (
      <nav aria-label="مسیر" className="text-sm text-stone-500">
        <span>خانه</span>
      </nav>
    );
  }

  const crumbs = buildBreadcrumbs(resolved);

  return (
    <nav aria-label="مسیر" className="flex flex-wrap items-center gap-1.5 text-sm">
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;
        return (
          <span key={`${crumb.label}-${index}`} className="flex items-center gap-1.5">
            {index > 0 ? <span className="text-stone-300">/</span> : null}
            {crumb.href && !isLast ? (
              <Link href={crumb.href} className="text-stone-500 transition hover:text-amber-800">
                {crumb.label}
              </Link>
            ) : (
              <span className={isLast ? 'font-medium text-stone-800' : 'text-stone-500'}>
                {crumb.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
