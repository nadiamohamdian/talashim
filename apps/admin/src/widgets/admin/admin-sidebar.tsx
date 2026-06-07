'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, LogOut, Pin, PanelLeft } from '@/shared/ui/icons';
import { useMemo, useState } from 'react';
import { Button } from '@sadafgold/ui';
import { getRoleLabelFa } from '@sadafgold/shared/admin-rbac';
import type { AdminPermissionKey } from '@/shared/config/admin-permissions';
import { ADMIN_NAV_SECTIONS, type ApiAvailability } from '@/shared/config/admin-navigation';
import { getSectionIcon } from '@/shared/lib/admin-nav-icons';
import {
  getNavItemIcon,
} from '@/shared/lib/admin-section-theme';
import { isNavItemActive } from '@/shared/lib/admin-route-resolver';
import type { SidebarMode } from '@/shared/model/admin-ui-store';
import { useAdminUiStore } from '@/shared/model/admin-ui-store';
import {
  syncAdminAuthCookieFromStore,
  useAdminAuthStore,
} from '@/features/auth/model/admin-auth-store';

const availabilityPip: Record<ApiAvailability, string> = {
  live: 'availability-pip availability-pip-live',
  partial: 'availability-pip availability-pip-partial',
  pending: 'availability-pip availability-pip-pending',
};

interface AdminSidebarProps {
  onNavigate?: () => void;
  mode?: SidebarMode;
}

export function AdminSidebar({ onNavigate, mode = 'expanded' }: AdminSidebarProps) {
  const pathname = usePathname();
  const clearSession = useAdminAuthStore((s) => s.clearSession);
  const user = useAdminAuthStore((s) => s.user);
  const permissions = useAdminAuthStore((s) => s.permissions);
  const hasPermission = useAdminAuthStore((s) => s.hasPermission);
  const sidebarPinned = useAdminUiStore((s) => s.sidebarPinned);
  const toggleSidebarPinned = useAdminUiStore((s) => s.toggleSidebarPinned);
  const toggleSidebarMini = useAdminUiStore((s) => s.toggleSidebarMini);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const isMini = mode === 'mini';

  const visibleSections = useMemo(
    () =>
      ADMIN_NAV_SECTIONS.map((section) => ({
        ...section,
        items: section.items.filter((item) =>
          hasPermission(item.permission as AdminPermissionKey),
        ),
      })).filter((section) => section.items.length > 0),
    [hasPermission, permissions],
  );

  return (
    <div className="flex h-full flex-col">
      <div className="sidebar-user-block">
        {user ? (
          <div className="flex items-center gap-2.5">
            <span className="sidebar-user-avatar" title={user.fullName ?? user.email}>
              {(user.fullName ?? user.email).charAt(0).toUpperCase()}
            </span>
            <div className="sidebar-user-meta min-w-0 flex-1">
              <p className="sidebar-user-name truncate text-sm font-semibold leading-tight">
                {user.fullName ?? user.email}
              </p>
              <p className="sidebar-user-email mt-1 truncate text-[var(--text-caption)]">
                {user.email}
              </p>
              <span className="sidebar-badge-role mt-2 inline-flex">
                {getRoleLabelFa(user.role)}
              </span>
            </div>
          </div>
        ) : null}
      </div>

      <nav className="sidebar-nav flex-1 overflow-y-auto px-2.5 py-2.5" aria-label="منوی اصلی">
        {visibleSections.map((section) => {
          const isSectionCollapsed = isMini ? true : (collapsed[section.id] ?? false);
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
                data-active={hasActiveItem}
                title={isMini ? section.label : undefined}
                className={`sidebar-section-trigger group flex w-full items-center gap-2 rounded-[var(--radius-md)] px-2 py-1.5 transition-all duration-200 ${
                  hasActiveItem
                    ? 'text-[var(--sidebar-foreground)]'
                    : 'text-[var(--sidebar-muted)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--sidebar-foreground)]'
                }`}
                onClick={() => {
                  if (isMini) return;
                  setCollapsed((prev) => ({ ...prev, [section.id]: !isSectionCollapsed }));
                }}
              >
                <span className="nav-section-icon">
                  <SectionIcon size={14} strokeWidth={1.75} aria-hidden />
                </span>
                <span className="sidebar-section-label flex-1 text-right">{section.label}</span>
                {!isMini ? (
                  <ChevronDown
                    size={13}
                    className={`sidebar-section-chevron shrink-0 text-[var(--sidebar-muted)] transition-transform duration-300 ease-out ${
                      isSectionCollapsed ? '-rotate-90' : 'rotate-0'
                    }`}
                    aria-hidden
                  />
                ) : null}
              </button>

              {!isMini ? (
                <div
                  id={sectionPanelId}
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                    isSectionCollapsed ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'
                  }`}
                >
                  <ul className="nav-stagger overflow-hidden">
                    <div className="space-y-0.5 py-1 pe-1 ps-4">
                      {section.items.map((item) => {
                        const active = isNavItemActive(pathname, item.href);
                        const ItemIcon = getNavItemIcon(item.routeId, section.id);
                        return (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              onClick={() => {
                                syncAdminAuthCookieFromStore();
                                onNavigate?.();
                              }}
                              data-active={active}
                              className="sidebar-nav-item"
                              title={item.label}
                            >
                              <span className="relative">
                                <span className="nav-item-icon">
                                  <ItemIcon size={13} strokeWidth={1.75} aria-hidden />
                                </span>
                                <span
                                  className={availabilityPip[item.availability]}
                                  title={item.availability}
                                />
                              </span>
                              <span className="sidebar-nav-label truncate">{item.label}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </div>
                  </ul>
                </div>
              ) : (
                <ul className="mt-1 space-y-0.5">
                  {section.items.map((item) => {
                    const active = isNavItemActive(pathname, item.href);
                    const ItemIcon = getNavItemIcon(item.routeId, section.id);
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => {
                            syncAdminAuthCookieFromStore();
                            onNavigate?.();
                          }}
                          data-active={active}
                          className="sidebar-nav-item sidebar-nav-item--mini justify-center"
                          title={item.label}
                        >
                          <span className="relative">
                            <span className="nav-item-icon">
                              <ItemIcon size={13} strokeWidth={1.75} aria-hidden />
                            </span>
                            <span
                              className={availabilityPip[item.availability]}
                              title={item.availability}
                            />
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </nav>

      <div className="sidebar-controls">
        <button
          type="button"
          className={`sidebar-control-btn ${sidebarPinned ? 'is-active' : ''}`}
          onClick={toggleSidebarPinned}
          aria-label={sidebarPinned ? 'منو ثابت است' : 'ثابت کردن منو'}
          title={sidebarPinned ? 'منو ثابت' : 'ثابت کردن منو'}
        >
          <Pin className="size-3.5" strokeWidth={1.5} />
        </button>
        <button
          type="button"
          className="sidebar-control-btn hidden lg:inline-flex"
          onClick={toggleSidebarMini}
          aria-label={isMini ? 'باز کردن منو' : 'حالت فشرده'}
          title={isMini ? 'باز کردن منو' : 'حالت فشرده'}
        >
          <PanelLeft className="size-3.5" strokeWidth={1.5} />
        </button>
      </div>

      <div className="sidebar-logout-zone">
        <Button
          variant="ghost"
          size="sm"
          className="sidebar-logout-btn w-full justify-start gap-2.5 rounded-[var(--radius-lg)] px-3 py-2 text-[var(--sidebar-muted)] hover:bg-[rgba(181,74,74,0.08)] hover:text-[var(--error)]"
          onClick={() => {
            clearSession();
            window.location.href = '/login';
          }}
        >
          <LogOut size={14} strokeWidth={1.5} aria-hidden />
          <span className="sidebar-logout-label">خروج از حساب</span>
        </Button>
      </div>
    </div>
  );
}
