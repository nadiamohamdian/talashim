import { ADMIN_NAV_ROUTES, ADMIN_ROUTE_SECTION_ORDER, type ApiAvailability } from './admin-routes';

export type { ApiAvailability };

export interface AdminNavItem {
  href: string;
  label: string;
  availability: ApiAvailability;
  permission: string;
  routeId: string;
}

export interface AdminNavSection {
  id: string;
  label: string;
  items: AdminNavItem[];
}

export const ADMIN_NAV_SECTIONS: AdminNavSection[] = ADMIN_ROUTE_SECTION_ORDER.map((sectionId) => {
  const routes = ADMIN_NAV_ROUTES.filter((r) => r.sectionId === sectionId);
  const sectionLabel = routes[0]?.sectionLabel ?? sectionId;
  return {
    id: sectionId,
    label: sectionLabel,
    items: routes.map((route) => ({
      href: route.path,
      label: route.label,
      availability: route.availability,
      permission: route.permission,
      routeId: route.id,
    })),
  };
}).filter((section) => section.items.length > 0);

export const ADMIN_FLAT_NAV = ADMIN_NAV_SECTIONS.flatMap((s) => s.items);

export { isNavItemActive } from '@/shared/lib/admin-route-resolver';
