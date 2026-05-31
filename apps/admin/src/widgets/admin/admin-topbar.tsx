'use client';

import { AdminBreadcrumbs } from './admin-breadcrumbs';

interface AdminTopbarProps {
  onOpenSidebar?: () => void;
}

export function AdminTopbar({ onOpenSidebar }: AdminTopbarProps) {
  return (
    <div
      className="border-b border-border px-4 py-3 sm:px-6 lg:px-8"
      style={{ background: 'var(--topbar-bg)' }}
    >
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-medium text-stone-700 shadow-sm lg:hidden"
          onClick={onOpenSidebar}
          aria-label="باز کردن منو"
        >
          منو
        </button>
        <div className="min-w-0 flex-1">
          <AdminBreadcrumbs />
        </div>
      </div>
    </div>
  );
}
