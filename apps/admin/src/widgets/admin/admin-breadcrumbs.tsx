'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft } from '@/shared/ui/icons';
import { buildBreadcrumbs, resolveAdminRoute } from '@/shared/lib/admin-route-resolver';

export function AdminBreadcrumbs() {
  const pathname = usePathname();
  const resolved = resolveAdminRoute(pathname);

  if (!resolved) {
    return (
      <nav aria-label="مسیر" className="text-caption">
        <span className="text-muted">خانه</span>
      </nav>
    );
  }

  const crumbs = buildBreadcrumbs(resolved);

  return (
    <nav aria-label="مسیر" className="flex flex-wrap items-center gap-1 text-sm">
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;
        return (
          <span key={`${crumb.label}-${index}`} className="flex items-center gap-1">
            {index > 0 ? (
              <ChevronLeft className="size-3 text-[var(--border)]" aria-hidden />
            ) : null}
            {crumb.href && !isLast ? (
              <Link
                href={crumb.href}
                className="text-muted transition-colors hover:text-foreground"
              >
                {crumb.label}
              </Link>
            ) : (
              <span
                className={isLast ? 'font-medium text-foreground' : 'text-muted'}
                aria-current={isLast ? 'page' : undefined}
              >
                {crumb.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
