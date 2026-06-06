'use client';

import { useState, type PropsWithChildren } from 'react';
import { AdminGuard } from '@/features/auth/components/admin-guard';
import { AdminSidebar } from './admin-sidebar';
import { AdminTopbar } from './admin-topbar';
import { AdminStoreHeader } from './admin-store-header';

export function AdminShell({ children }: PropsWithChildren) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <AdminGuard>
      <div className="flex min-h-screen flex-col bg-background">
        <AdminStoreHeader />

        <div className="flex min-h-0 flex-1">
          {/* Desktop sidebar */}
          <div
            className="hidden shrink-0 border-l border-[var(--sidebar-border)] lg:block"
            style={{ width: 'var(--sidebar-width)' }}
          >
            <div
              className="sticky top-[var(--header-height)] bg-[var(--sidebar-bg)]"
              style={{ height: 'calc(100vh - var(--header-height))' }}
            >
              <AdminSidebar />
            </div>
          </div>

          {/* Mobile drawer */}
          {mobileNavOpen ? (
            <div className="fixed inset-0 z-40 lg:hidden">
              <button
                type="button"
                className="admin-overlay absolute inset-0"
                aria-label="بستن منو"
                onClick={() => setMobileNavOpen(false)}
              />
              <div
                className="absolute inset-y-0 right-0 max-w-[85vw] border-l border-[var(--sidebar-border)] bg-[var(--sidebar-bg)] shadow-[var(--shadow-dialog)]"
                style={{ width: 'var(--sidebar-width)' }}
              >
                <AdminSidebar onNavigate={() => setMobileNavOpen(false)} />
              </div>
            </div>
          ) : null}

          {/* Main content */}
          <div className="flex min-w-0 flex-1 flex-col">
            <AdminTopbar onOpenSidebar={() => setMobileNavOpen(true)} />
            <main className="mx-auto w-full max-w-[var(--content-max-width)] flex-1 px-4 py-5 sm:px-6 lg:px-8 animate-fade-in">
              {children}
            </main>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
