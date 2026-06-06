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
      <div className="border-b border-[var(--sidebar-border)] px-4 py-3.5">
        {user ? (
          <div className="flex items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--secondary)] text-xs font-bold text-[var(--secondary-foreground)]">
              {(user.fullName ?? user.email).charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold leading-tight text-foreground">
                {user.fullName ?? user.email}
              </p>
              <p className="mt-0.5 truncate text-[var(--text-caption)] text-muted">{user.email}</p>
              <span className="badge-gold mt-1.5 inline-flex">{getRoleLabelFa(user.role)}</span>
            </div>
          </div>
        ) : null}
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav flex-1 overflow-y-auto px-2.5 py-3" aria-label="منوی اصلی">
        {visibleSections.map((section) => {
          const isSectionCollapsed = collapsed[section.id] ?? false;
          const sectionPanelId = `sidebar-section-${section.id}`;
          const SectionIcon = getSectionIcon(section.id);
          const hasActiveItem = section.items.some((item) =>
            isNavItemActive(pathname, item.href),
          );

          return (
            <div key={section.id} className="mb-2">
              <button
                type="button"
                aria-expanded={!isSectionCollapsed}
                aria-controls={sectionPanelId}
                className={`sidebar-section-trigger group flex w-full items-center gap-2 rounded-[var(--radius-md)] px-2 py-1.5 transition-all duration-150 ${
                  hasActiveItem
                    ? 'text-foreground'
                    : 'text-[var(--muted-foreground)] hover:bg-[var(--sidebar-hover)] hover:text-foreground'
                }`}
                onClick={() =>
                  setCollapsed((prev) => ({ ...prev, [section.id]: !isSectionCollapsed }))
                }
              >
                <SectionIcon
                  size={15}
                  className={
                    hasActiveItem
                      ? 'text-[var(--primary)]'
                      : 'text-[var(--muted)] group-hover:text-[var(--primary)]'
                  }
                  strokeWidth={1.75}
                  aria-hidden
                />
                <span className="sidebar-section-label flex-1 text-right">{section.label}</span>
                <ChevronDown
                  size={13}
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
                  <div className="space-y-0.5 py-1 pe-0.5 ps-5">
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
                            data-active={active}
                            className="sidebar-nav-item text-[var(--muted-foreground)]"
                          >
                            <span
                              className={`size-1.5 shrink-0 rounded-full ${availabilityDot[item.availability]}`}
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

      {/* Logout */}
      <div className="border-t border-[var(--sidebar-border)] p-2.5">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 px-2.5 text-[var(--muted-foreground)] hover:text-[var(--error)]"
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
