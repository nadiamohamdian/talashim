'use client';

import { Menu } from '@/shared/ui/icons';
import { AdminBreadcrumbs } from './admin-breadcrumbs';

interface AdminTopbarProps {
  onOpenSidebar?: () => void;
}

export function AdminTopbar({ onOpenSidebar }: AdminTopbarProps) {
  return (
    <div
      className="sticky top-[var(--header-height)] z-20 border-b border-[var(--border-subtle)] bg-[var(--topbar-bg)] backdrop-blur-xl"
      style={{ height: 'var(--topbar-height)' }}
    >
      <div className="flex h-full items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          className="flex size-8 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--card)] text-foreground transition hover:border-[var(--primary)]/30 lg:hidden"
          onClick={onOpenSidebar}
          aria-label="باز کردن منو"
        >
          <Menu className="size-4" strokeWidth={1.75} />
        </button>
        <div className="min-w-0 flex-1">
          <AdminBreadcrumbs />
        </div>
      </div>
    </div>
  );
}
