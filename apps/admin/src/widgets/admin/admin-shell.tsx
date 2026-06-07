'use client';

import { useState, type PropsWithChildren } from 'react';
import { AdminGuard } from '@/features/auth/components/admin-guard';
import { useAdminUiStore } from '@/shared/model/admin-ui-store';
import { AdminChromeHeader } from './admin-chrome-header';
import { AdminSidebar } from './admin-sidebar';

export function AdminShell({ children }: PropsWithChildren) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const sidebarMode = useAdminUiStore((s) => s.sidebarMode);

  const railClass = [
    'admin-sidebar-rail hidden lg:block',
    sidebarMode === 'mini' ? 'admin-sidebar-rail--mini' : '',
    sidebarMode === 'collapsed' ? 'admin-sidebar-rail--collapsed' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <AdminGuard>
      <div className="admin-app">
        <AdminChromeHeader onOpenSidebar={() => setMobileNavOpen(true)} />

        <div className="admin-layout">
          <aside className={railClass}>
            <div className="admin-sidebar-panel" data-mode={sidebarMode}>
              <AdminSidebar mode={sidebarMode} />
            </div>
          </aside>

          {mobileNavOpen ? (
            <div className="fixed inset-0 z-50 lg:hidden">
              <button
                type="button"
                className="admin-overlay absolute inset-0"
                aria-label="بستن منو"
                onClick={() => setMobileNavOpen(false)}
              />
              <div className="admin-sidebar-panel admin-sidebar-panel--drawer" data-mode="expanded">
                <AdminSidebar mode="expanded" onNavigate={() => setMobileNavOpen(false)} />
              </div>
            </div>
          ) : null}

          <main className="admin-main content-enter">{children}</main>
        </div>
      </div>
    </AdminGuard>
  );
}
