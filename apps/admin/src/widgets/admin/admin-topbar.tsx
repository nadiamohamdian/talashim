'use client';

import { Menu } from '@/shared/ui/icons';
import { AdminBreadcrumbs } from './admin-breadcrumbs';

interface AdminTopbarProps {
  onOpenSidebar?: () => void;
}

export function AdminTopbar({ onOpenSidebar }: AdminTopbarProps) {
  return (
    <div
      className="topbar-glass sticky top-[var(--header-height)] z-20"
      style={{ height: 'var(--topbar-height)' }}
    >
      <div className="flex h-full items-center gap-3 px-4 sm:px-5 lg:px-6">
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--card)] text-foreground shadow-[var(--shadow-xs)] transition hover:border-[color-mix(in_srgb,var(--primary)_25%,var(--border))] hover:shadow-[var(--shadow-soft)] lg:hidden"
          onClick={onOpenSidebar}
          aria-label="باز کردن منو"
        >
          <Menu className="size-4" strokeWidth={1.5} />
        </button>
        <div className="min-w-0 flex-1">
          <AdminBreadcrumbs />
        </div>
      </div>
    </div>
  );
}
