'use client';

import type { PropsWithChildren } from 'react';
import { AdminGuard } from '@/features/auth/components/admin-guard';
import { AdminSidebar } from './admin-sidebar';

export function AdminShell({ children }: PropsWithChildren) {
  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-stone-100 dark:bg-zinc-950">
        <div className="hidden w-64 shrink-0 lg:block">
          <AdminSidebar />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-stone-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900 lg:hidden">
            <p className="text-sm font-semibold text-stone-900 dark:text-zinc-100">منوی ادمین</p>
            <nav className="mt-2 flex gap-2 overflow-x-auto pb-1 text-xs">
              {[
                { href: '/', label: 'داشبورد' },
                { href: '/users', label: 'کاربران' },
                { href: '/kyc', label: 'KYC' },
                { href: '/transactions', label: 'تراکنش' },
                { href: '/wallets', label: 'کیف' },
                { href: '/audit', label: 'لاگ' },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="whitespace-nowrap rounded-lg bg-stone-100 px-3 py-1.5 dark:bg-zinc-800"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </AdminGuard>
  );
}
