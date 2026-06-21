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

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <MemberLoginPrompt
      title={title}
      description={description ?? 'برای دسترسی به این بخش وارد حساب کاربری شوید.'}
      returnPath={returnPath}
    >
      <div className="account-page store-chrome-light store-minimal-header">
        <div className="account-page-inner">
          <nav className="account-page-nav-mobile" aria-label="پنل کاربری">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`account-page-nav-link${isActive(item.href) ? ' is-active' : ''}`}
                aria-current={isActive(item.href) ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="account-page-layout">
            <aside className="account-page-sidebar" aria-label="پنل کاربری">
              <p className="account-page-sidebar-label">پنل کاربری</p>
              <nav className="account-page-sidebar-nav">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`account-page-sidebar-link${isActive(item.href) ? ' is-active' : ''}`}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </aside>

            <div className="account-page-main">
              <header className="account-page-header">
                <h1 className="account-page-title">{title}</h1>
                {description ? (
                  <p className="account-page-description">{description}</p>
                ) : null}
              </header>
              {children}
            </div>
          </div>
        </div>
      </div>
    </MemberLoginPrompt>
  );
}
