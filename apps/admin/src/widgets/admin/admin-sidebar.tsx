'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, LogOut } from '@/shared/ui/icons';
import { useMemo, useState } from 'react';
import { Button } from '@sadafgold/ui';
import { getRoleLabelFa } from '@sadafgold/shared/admin-rbac';
import type { AdminPermissionKey } from '@/shared/config/admin-permissions';
import { ADMIN_NAV_SECTIONS, type ApiAvailability } from '@/shared/config/admin-navigation';
import { getSectionIcon } from '@/shared/lib/admin-nav-icons';
import { isNavItemActive } from '@/shared/lib/admin-route-resolver';
import {
  syncAdminAuthCookieFromStore,
  useAdminAuthStore,
} from '@/features/auth/model/admin-auth-store';

const availabilityDot: Record<ApiAvailability, string> = {
  live: 'bg-[var(--success)]',
  partial: 'bg-[var(--warning)]',
  pending: 'bg-[var(--muted)]',
};

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
    <aside className="flex h-full flex-col bg-[var(--sidebar-bg)] text-foreground">
      {/* User profile */}
      <div className="border-b border-[var(--sidebar-border)] px-4 py-4">
        {user ? (
          <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--primary)] text-sm font-bold text-white">
              {(user.fullName ?? user.email).charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {user.fullName ?? user.email}
              </p>
              <p className="truncate text-xs text-muted">{user.email}</p>
              <span className="badge-gold mt-1.5 inline-flex">{getRoleLabelFa(user.role)}</span>
            </div>
          </div>
        ) : null}
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav flex-1 overflow-y-auto px-3 py-4" aria-label="منوی اصلی">
        {visibleSections.map((section) => {
          const isSectionCollapsed = collapsed[section.id] ?? false;
          const sectionPanelId = `sidebar-section-${section.id}`;
          const SectionIcon = getSectionIcon(section.id);
          const hasActiveItem = section.items.some((item) =>
            isNavItemActive(pathname, item.href),
          );

          return (
            <div key={section.id} className="mb-1">
              <button
                type="button"
                aria-expanded={!isSectionCollapsed}
                aria-controls={sectionPanelId}
                className={`sidebar-section-trigger group flex w-full items-center gap-2.5 rounded-[var(--radius-lg)] px-2.5 py-2 transition-all duration-150 ${
                  hasActiveItem
                    ? 'bg-[var(--sidebar-active)] text-foreground'
                    : 'text-[var(--muted-foreground)] hover:bg-[var(--sidebar-hover)] hover:text-foreground'
                }`}
                onClick={() =>
                  setCollapsed((prev) => ({ ...prev, [section.id]: !isSectionCollapsed }))
                }
              >
                <SectionIcon
                  size={16}
                  className={hasActiveItem ? 'text-[var(--primary)]' : 'text-[var(--muted)] group-hover:text-[var(--primary)]'}
                  strokeWidth={1.75}
                  aria-hidden
                />
                <span className="flex-1 text-right text-xs font-semibold tracking-wide">
                  {section.label}
                </span>
                <span className="rounded-full bg-[var(--surface-muted)] px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-muted">
                  {section.items.length}
                </span>
                <ChevronDown
                  size={14}
                  className={`shrink-0 text-muted transition-transform duration-200 ${
                    isSectionCollapsed ? '-rotate-90' : 'rotate-0'
                  }`}
                  aria-hidden
                />
              </button>

              <div
                id={sectionPanelId}
                className={`grid transition-[grid-template-rows] duration-200 ease-out ${
                  isSectionCollapsed ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'
                }`}
              >
                <ul className="overflow-hidden">
                  <div className="space-y-0.5 py-1 pe-1 ps-7">
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
                            className={`group/link flex items-center gap-2 rounded-[var(--radius-md)] px-2.5 py-2 text-sm transition-all duration-150 ${
                              active
                                ? 'bg-[var(--sidebar-active)] font-semibold text-foreground ring-1 ring-[var(--primary)]/25'
                                : 'text-[var(--muted-foreground)] hover:bg-[var(--sidebar-hover)] hover:text-foreground'
                            }`}
                          >
                            <span
                              className={`size-1.5 shrink-0 rounded-full ${availabilityDot[item.availability]}`}
                              title={item.availability}
                            />
                            <span className="truncate">{item.label}</span>
                            {active ? (
                              <span className="ms-auto size-1.5 rounded-full bg-[var(--primary)]" />
                            ) : null}
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

      {/* Logout */}
      <div className="border-t border-[var(--sidebar-border)] p-3">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-center gap-2"
          onClick={() => {
            clearSession();
            window.location.href = '/login';
          }}
        >
          <LogOut size={14} aria-hidden />
          خروج از حساب
        </Button>
      </div>
    </aside>
  );
}
