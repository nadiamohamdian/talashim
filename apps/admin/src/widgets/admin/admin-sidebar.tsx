'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Button } from '@sadafgold/ui';
import { getRoleLabelFa } from '@sadafgold/shared/admin-rbac';
import type { AdminPermissionKey } from '@/shared/config/admin-permissions';
import { ADMIN_NAV_SECTIONS, type ApiAvailability } from '@/shared/config/admin-navigation';
import { isNavItemActive } from '@/shared/lib/admin-route-resolver';
import {
  syncAdminAuthCookieFromStore,
  useAdminAuthStore,
} from '@/features/auth/model/admin-auth-store';

const availabilityDot: Record<ApiAvailability, string> = {
  live: 'bg-emerald-500',
  partial: 'bg-amber-500',
  pending: 'bg-nude-300',
};

function SectionChevron({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 text-stone-400 transition-transform duration-200 ${collapsed ? '-rotate-90' : 'rotate-0'}`}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
        clipRule="evenodd"
      />
    </svg>
  );
}

interface AdminSidebarProps {
  onNavigate?: () => void;
}

export function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();
  const clearSession = useAdminAuthStore((s) => s.clearSession);
  const user = useAdminAuthStore((s) => s.user);
  const hasPermission = useAdminAuthStore((s) => s.hasPermission);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const visibleSections = useMemo(
    () =>
      ADMIN_NAV_SECTIONS.map((section) => ({
        ...section,
        items: section.items.filter((item) =>
          hasPermission(item.permission as AdminPermissionKey),
        ),
      })).filter((section) => section.items.length > 0),
    [hasPermission],
  );

  return (
    <aside className="flex h-full flex-col bg-nude-50 text-foreground">
      <div className="border-b border-border bg-gradient-to-l from-white to-nude-50/80 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">کاربر فعال</p>
        {user ? (
          <>
            <p className="mt-1 truncate text-sm font-semibold text-stone-800">{user.fullName ?? user.email}</p>
            <p className="mt-0.5 truncate text-xs text-muted">{user.email}</p>
            <span className="badge-gold mt-2 inline-flex">{getRoleLabelFa(user.role)}</span>
          </>
        ) : null}
      </div>

      <nav className="sidebar-nav flex-1 overflow-y-auto p-3" aria-label="منوی اصلی">
        {visibleSections.map((section) => {
          const isSectionCollapsed = collapsed[section.id] ?? false;
          const sectionPanelId = `sidebar-section-${section.id}`;

          return (
            <div key={section.id} className="mb-2">
              <button
                type="button"
                aria-expanded={!isSectionCollapsed}
                aria-controls={sectionPanelId}
                className="sidebar-section-trigger group flex w-full items-center gap-2 rounded-xl border border-transparent px-2.5 py-2.5 transition hover:border-border hover:bg-white/90 hover:shadow-sm"
                onClick={() =>
                  setCollapsed((prev) => ({ ...prev, [section.id]: !isSectionCollapsed }))
                }
              >
                <SectionChevron collapsed={isSectionCollapsed} />
                <span className="flex-1 text-right text-xs font-bold tracking-wide text-stone-700 group-hover:text-stone-900">
                  {section.label}
                </span>
                <span className="rounded-full bg-nude-100 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-muted">
                  {section.items.length}
                </span>
              </button>

              <div
                id={sectionPanelId}
                className={`grid transition-[grid-template-rows] duration-200 ease-out ${
                  isSectionCollapsed ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'
                }`}
              >
                <ul className="overflow-hidden">
                  <div className="space-y-0.5 py-1 pr-1">
                    {section.items.map((item) => {
                      const active = isNavItemActive(pathname, item.href);
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => {
                              syncAdminAuthCookieFromStore();
                              onNavigate?.();
                            }}
                            className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition ${
                              active
                                ? 'border-2 border-amber-500 bg-amber-50 font-bold text-amber-900 shadow-md'
                                : 'text-stone-600 hover:bg-white hover:text-stone-900'
                            }`}
                          >
                            <span
                              className={`h-2 w-2 shrink-0 rounded-full ring-2 ring-white ${availabilityDot[item.availability]}`}
                              title={item.availability}
                            />
                            <span className="truncate">{item.label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </div>
                </ul>
              </div>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-border bg-white/80 p-4">
        <Button
          variant="outline"
          className="w-full border-border bg-white text-stone-700 hover:border-gold-light hover:bg-nude-50"
          onClick={() => {
            clearSession();
            window.location.href = '/login';
          }}
        >
          خروج از حساب
        </Button>
      </div>
    </aside>
  );
}
