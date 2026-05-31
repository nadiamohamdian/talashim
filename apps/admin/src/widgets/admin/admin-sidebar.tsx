'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@sadafgold/ui';
import { adminEnv } from '@/shared/config/env';
import { useAdminAuthStore } from '@/features/auth/model/admin-auth-store';

const links = [
  { href: '/', label: 'داشبورد' },
  { href: '/users', label: 'کاربران' },
  { href: '/kyc', label: 'احراز هویت' },
  { href: '/transactions', label: 'تراکنش‌ها' },
  { href: '/wallets', label: 'کیف پول' },
  { href: '/audit', label: 'لاگ ممیزی' },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();
  const clearSession = useAdminAuthStore((s) => s.clearSession);
  const user = useAdminAuthStore((s) => s.user);

  return (
    <aside className="flex h-full flex-col border-l border-stone-200 bg-zinc-950 text-zinc-100 dark:border-zinc-800">
      <div className="border-b border-zinc-800 p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-amber-400">Enterprise</p>
        <h1 className="mt-1 text-lg font-bold">{adminEnv.NEXT_PUBLIC_ADMIN_APP_NAME}</h1>
        {user ? <p className="mt-2 truncate text-xs text-zinc-400">{user.email}</p> : null}
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {links.map((link) => {
          const active =
            link.href === '/'
              ? pathname === '/'
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                active
                  ? 'bg-amber-500/15 text-amber-300'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4">
        <Button
          variant="outline"
          className="w-full border-zinc-700 text-zinc-200"
          onClick={() => {
            clearSession();
            window.location.href = '/login';
          }}
        >
          خروج
        </Button>
      </div>
    </aside>
  );
}
