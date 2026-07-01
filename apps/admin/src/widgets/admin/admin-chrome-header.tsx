'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Bell, ExternalLink, Menu, PanelLeft, PanelLeftClose } from '@/shared/ui/icons';
import { adminEnv } from '@/shared/config/env';
import { useAdminUiStore } from '@/shared/model/admin-ui-store';
import { fetchNotificationInbox } from '@/features/notifications/api/notifications-api';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { AdminBreadcrumbs } from './admin-breadcrumbs';
import { AdminGoldPill } from './admin-gold-pill';
import { AdminNavSearch } from './admin-nav-search';
import { AdminProfileMenu } from './admin-profile-menu';
import { AdminThemeToggle } from './admin-theme-toggle';

interface AdminChromeHeaderProps {
  onOpenSidebar?: () => void;
}

export function AdminChromeHeader({ onOpenSidebar }: AdminChromeHeaderProps) {
  const sidebarMode = useAdminUiStore((s) => s.sidebarMode);
  const toggleSidebarMini = useAdminUiStore((s) => s.toggleSidebarMini);
  const toggleSidebarCollapsed = useAdminUiStore((s) => s.toggleSidebarCollapsed);
  const { data: inboxSummary } = useQuery({
    queryKey: adminQueryKeys.notifications.inbox(1, true, ''),
    queryFn: () => fetchNotificationInbox({ page: 1, limit: 1, unreadOnly: true }),
    refetchInterval: 60_000,
  });
  const unreadCount = inboxSummary?.summary.unreadCount ?? 0;

  return (
    <header className="admin-chrome-header">
      <div className="admin-chrome-header-inner">
        <div className="flex min-w-0 items-center gap-2.5">
          <button
            type="button"
            className="admin-icon-btn lg:hidden"
            onClick={onOpenSidebar}
            aria-label="باز کردن منو"
          >
            <Menu className="size-4" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            className="admin-icon-btn hidden lg:inline-flex"
            onClick={toggleSidebarCollapsed}
            aria-label={sidebarMode === 'collapsed' ? 'نمایش منو' : 'پنهان کردن منو'}
          >
            {sidebarMode === 'collapsed' ? (
              <PanelLeft className="size-4" strokeWidth={1.5} />
            ) : (
              <PanelLeftClose className="size-4" strokeWidth={1.5} />
            )}
          </button>
          <Link href="/" className="admin-brand group hidden shrink-0 sm:flex">
            <span className="admin-brand-mark" aria-hidden>
              ط
            </span>
            <span className="admin-brand-text">
              <span className="admin-brand-en">Talashim</span>
              <span className="admin-brand-fa">{adminEnv.NEXT_PUBLIC_ADMIN_APP_NAME}</span>
            </span>
          </Link>
          <div className="hidden min-w-0 lg:block">
            <AdminBreadcrumbs />
          </div>
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-center px-2 md:px-4">
          <AdminNavSearch />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <AdminGoldPill />
          <Link
            href="/notifications"
            className="admin-icon-btn admin-icon-btn--notify relative"
            aria-label={unreadCount > 0 ? `اعلان‌ها — ${unreadCount} خوانده‌نشده` : 'اعلان‌ها'}
          >
            <Bell className="size-4" strokeWidth={1.5} />
            {unreadCount > 0 ? (
              <span className="admin-notify-dot" aria-hidden />
            ) : null}
          </Link>
          <Link
            href="http://localhost:3000"
            className="admin-icon-btn admin-icon-btn--labeled hidden sm:inline-flex"
            aria-label="فروشگاه"
          >
            <span className="admin-icon-btn-label">فروشگاه</span>
            <ExternalLink className="size-3.5 shrink-0" strokeWidth={1.5} aria-hidden />
          </Link>
          <AdminThemeToggle />
          <button
            type="button"
            className="admin-icon-btn hidden xl:inline-flex"
            onClick={toggleSidebarMini}
            aria-label={sidebarMode === 'mini' ? 'باز کردن منوی کامل' : 'حالت فشرده منو'}
          >
            <PanelLeft className="size-4" strokeWidth={1.5} />
          </button>
          <AdminProfileMenu />
        </div>
      </div>
      <div className="admin-chrome-header-mobile-crumb px-4 pb-2 lg:hidden">
        <AdminBreadcrumbs />
      </div>
    </header>
  );
}
