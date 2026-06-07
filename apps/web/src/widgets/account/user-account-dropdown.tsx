'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useAuth, useLogoutMutation } from '@/features/auth/hooks/use-auth';
import { useFeatureFlag } from '@/shared/providers/storefront-settings-provider';
import { buildLoginHref } from '@/shared/routing/safe-redirect';
import { IconUser } from '@/shared/ui/icons';

const BASE_MENU_ITEMS = [
  { href: '/dashboard', label: 'پیشخوان' },
  { href: '/wallet', label: 'کیف پول' },
  { href: '/orders', label: 'سفارش‌ها' },
  { href: '/invoices', label: 'دانلودها' },
  { href: '/addresses', label: 'آدرس' },
  { href: '/profile', label: 'اطلاعات حساب کاربری' },
] as const;

export function UserAccountDropdown() {
  const { isAuthenticated, user } = useAuth();
  const wishlistEnabled = useFeatureFlag('enableWishlist');
  const logoutMutation = useLogoutMutation();
  const menuItems = wishlistEnabled
    ? [...BASE_MENU_ITEMS, { href: '/wishlist', label: 'علاقه‌مندی' } as const]
    : BASE_MENU_ITEMS;
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  if (!isAuthenticated) {
    return (
      <Link
        href={buildLoginHref('/account')}
        className="inline-flex items-center gap-2.5 rounded-xl px-1.5 py-1 transition hover:bg-nude-50"
      >
        <span className="inline-flex rounded-lg bg-nude-50 p-2 text-gold-dark">
          <IconUser className="h-5 w-5" />
        </span>
        <span className="hidden flex-col items-start leading-tight lg:flex">
          <span className="text-[11px] text-muted">حساب کاربری</span>
          <span className="text-sm font-semibold text-foreground">ورود / ثبت‌نام</span>
        </span>
      </Link>
    );
  }

  const displayName = user?.fullName ?? 'حساب من';

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-2.5 rounded-xl px-1.5 py-1 transition hover:bg-nude-50"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="inline-flex rounded-lg bg-nude-50 p-2 text-gold-dark">
          <IconUser className="h-5 w-5" />
        </span>
        <span className="hidden flex-col items-start leading-tight lg:flex">
          <span className="text-[11px] text-muted">سلام،</span>
          <span className="max-w-[140px] truncate text-sm font-semibold text-foreground">
            {displayName}
          </span>
        </span>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute left-0 top-[calc(100%+0.5rem)] z-50 min-w-[220px] overflow-hidden rounded-xl border border-nude-200 bg-white py-2 shadow-lg"
        >
          <div className="border-b border-nude-100 px-4 py-2 text-xs text-muted">
            {user?.email}
          </div>
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className={`block px-4 py-2.5 text-sm transition hover:bg-nude-50 ${
                pathname === item.href || pathname.startsWith(`${item.href}/`)
                  ? 'font-semibold text-gold-dark'
                  : 'text-foreground'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <button
            type="button"
            role="menuitem"
            disabled={logoutMutation.isPending}
            onClick={() => {
              setOpen(false);
              logoutMutation.mutate();
            }}
            className="block w-full px-4 py-2.5 text-right text-sm text-red-600 transition hover:bg-red-50 disabled:opacity-60"
          >
            {logoutMutation.isPending ? 'در حال خروج...' : 'خروج'}
          </button>
        </div>
      ) : null}
    </div>
  );
}
