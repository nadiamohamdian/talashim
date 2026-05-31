import {
  ADMIN_ROUTE_BY_ID,
  ADMIN_ROUTES,
  type AdminRouteDefinition,
} from '@/shared/config/admin-routes';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface ResolvedAdminRoute {
  route: AdminRouteDefinition;
  /** Last breadcrumb segment label (e.g. dynamic id). */
  tailLabel?: string;
}

function normalizePath(pathname: string): string {
  if (!pathname || pathname === '/') return '/';
  const trimmed = pathname.replace(/\/+$/, '') || '/';
  return trimmed;
}

/** Longest static path match, then dynamic prefix rules. */
export function resolveAdminRoute(pathname: string): ResolvedAdminRoute | null {
  const path = normalizePath(pathname);

  const staticMatch = ADMIN_ROUTES.filter((r) => !r.dynamic)
    .sort((a, b) => b.path.length - a.path.length)
    .find((r) => r.path === path);

  if (staticMatch) {
    return { route: staticMatch };
  }

  const dynamicMatchers: Array<{ routeId: string; test: (p: string) => string | null }> = [
    {
      routeId: 'products.edit',
      test: (p) => {
        const m = /^\/products\/([^/]+)\/edit$/.exec(p);
        return m?.[1] ?? null;
      },
    },
    {
      routeId: 'products.detail',
      test: (p) => {
        if (p === '/products/new') return null;
        const m = /^\/products\/([^/]+)$/.exec(p);
        return m?.[1] ?? null;
      },
    },
    {
      routeId: 'orders.detail',
      test: (p) => {
        const m = /^\/orders\/([^/]+)$/.exec(p);
        return m?.[1] ?? null;
      },
    },
    {
      routeId: 'users.detail',
      test: (p) => {
        const m = /^\/users\/([^/]+)$/.exec(p);
        const id = m?.[1];
        if (!id || id === 'kyc' || id === 'roles' || id === 'permissions') return null;
        return id;
      },
    },
  ];

  for (const matcher of dynamicMatchers) {
    const tail = matcher.test(path);
    if (tail) {
      const route = ADMIN_ROUTE_BY_ID[matcher.routeId];
      if (route) {
        return { route, tailLabel: tail };
      }
    }
  }

  return null;
}

export function buildBreadcrumbs(resolved: ResolvedAdminRoute): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [];
  const visited = new Set<string>();
  let current: AdminRouteDefinition | undefined = resolved.route;

  while (current && !visited.has(current.id)) {
    visited.add(current.id);
    items.unshift({
      label: current.label,
      href: current.dynamic ? undefined : current.path,
    });
    current = current.parentId ? ADMIN_ROUTE_BY_ID[current.parentId] : undefined;
  }

  items.unshift({ label: 'خانه', href: '/' });

  if (resolved.tailLabel) {
    items.push({ label: resolved.tailLabel });
  }

  return items;
}

export function isNavItemActive(pathname: string, href: string): boolean {
  const path = normalizePath(pathname);
  const target = normalizePath(href);
  if (target === '/') return path === '/';
  return path === target || path.startsWith(`${target}/`);
}
