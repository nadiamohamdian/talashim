'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { PropsWithChildren } from 'react';
import { MemberLoginPrompt } from '@/features/auth/components/member-login-prompt';
import { useFeatureFlag } from '@/shared/providers/storefront-settings-provider';

const BASE_NAV_ITEMS = [
  { href: '/dashboard', label: 'پیشخوان' },
  { href: '/wallet', label: 'کیف پول' },
  { href: '/orders', label: 'سفارش‌ها' },
  { href: '/invoices', label: 'فاکتورها' },
  { href: '/addresses', label: 'آدرس' },
  { href: '/profile', label: 'اطلاعات حساب' },
] as const;

interface AccountShellProps extends PropsWithChildren {
  title: string;
  description?: string;
  returnPath: string;
}

export function AccountShell({ title, description, returnPath, children }: AccountShellProps) {
  const pathname = usePathname();
  const wishlistEnabled = useFeatureFlag('enableWishlist');
  const navItems = wishlistEnabled
    ? [...BASE_NAV_ITEMS, { href: '/wishlist', label: 'علاقه‌مندی' } as const]
    : BASE_NAV_ITEMS;

  return (
    <MemberLoginPrompt
      title={title}
      description={description ?? 'برای دسترسی به این بخش وارد حساب کاربری شوید.'}
      returnPath={returnPath}
    >
      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8">
        <aside className="card-luxury h-fit p-3">
          <p className="px-3 py-2 text-xs font-semibold text-muted">پنل کاربری</p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-lg px-3 py-2.5 text-sm transition ${
                    active
                      ? 'bg-gold-dark/10 font-semibold text-gold-dark'
                      : 'text-foreground hover:bg-nude-50'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            {description ? <p className="mt-2 text-sm text-muted">{description}</p> : null}
          </div>
          {children}
        </div>
      </div>
    </MemberLoginPrompt>
  );
}
