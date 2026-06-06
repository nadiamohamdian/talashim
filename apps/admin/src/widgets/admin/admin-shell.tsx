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
      <div className="flex min-h-screen flex-col bg-white">
        <AdminStoreHeader />

        <div className="flex min-h-0 flex-1 bg-white">
          <div className="hidden w-72 shrink-0 border-l border-border lg:block">
            <div className="sticky top-14 h-[calc(100vh-3.5rem)] bg-nude-50">
              <AdminSidebar />
            </div>
          </div>

          {mobileNavOpen ? (
            <div className="fixed inset-0 z-40 lg:hidden">
              <button
                type="button"
                className="absolute inset-0 bg-stone-900/30"
                aria-label="بستن منو"
                onClick={() => setMobileNavOpen(false)}
              />
              <div className="absolute inset-y-0 right-0 w-72 max-w-[85vw] border-l border-border bg-nude-50 shadow-xl">
                <AdminSidebar onNavigate={() => setMobileNavOpen(false)} />
              </div>
            </div>
          ) : null}

          <div className="flex min-w-0 flex-1 flex-col bg-gradient-to-b from-nude-50/40 to-white">
            <AdminTopbar onOpenSidebar={() => setMobileNavOpen(true)} />
            <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
