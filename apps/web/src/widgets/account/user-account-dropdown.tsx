'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useAuth, useLogoutMutation } from '@/features/auth/hooks/use-auth';
import { useFeatureFlag } from '@/shared/providers/storefront-settings-provider';
import { buildLoginHref } from '@/shared/routing/safe-redirect';
import { IconMenuProfile } from '@/widgets/header/header-menu-icons';
import { IconUser } from '@/shared/ui/icons';

const BASE_MENU_ITEMS = [
  { href: '/dashboard', label: 'پیشخوان' },
  { href: '/wallet', label: 'کیف پول' },
  { href: '/orders', label: 'سفارش‌ها' },
  { href: '/invoices', label: 'فاکتورها' },
  { href: '/addresses', label: 'آدرس' },
  { href: '/profile/info', label: 'اطلاعات حساب' },
  { href: '/profile/password', label: 'رمز عبور' },
] as const;

interface UserAccountDropdownProps {
  variant?: 'default' | 'menu-icon';
  surface?: 'mobile' | 'desktop';
}

export function UserAccountDropdown({ variant = 'default', surface = 'mobile' }: UserAccountDropdownProps) {
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

  const menuIconActionClass =
    surface === 'desktop' ? 'desktop-menu-bar-action' : 'mobile-menu-bar-action';
  const menuIconProfileClass =
    surface === 'desktop'
      ? 'desktop-menu-bar-icon desktop-menu-bar-icon-profile'
      : 'mobile-menu-bar-icon mobile-menu-bar-icon-profile';
  const menuIconWrapClass =
    surface === 'desktop' ? 'desktop-menu-bar-action-wrap' : 'mobile-menu-bar-action-wrap';

  if (!isAuthenticated) {
    if (variant === 'menu-icon') {
      return (
        <Link href={buildLoginHref('/profile')} className={menuIconActionClass} aria-label="حساب کاربری">
          <IconMenuProfile className={menuIconProfileClass} />
        </Link>
      );
    }

    return (
      <Link
        href={buildLoginHref('/profile')}
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
    <div
      ref={rootRef}
      className={variant === 'menu-icon' ? menuIconWrapClass : 'relative'}
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={
          variant === 'menu-icon'
            ? menuIconActionClass
            : 'inline-flex items-center gap-2.5 rounded-xl px-1.5 py-1 transition hover:bg-nude-50'
        }
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="حساب کاربری"
      >
        {variant === 'menu-icon' ? (
          <IconMenuProfile className={menuIconProfileClass} />
        ) : (
          <>
            <span className="inline-flex rounded-lg bg-nude-50 p-2 text-gold-dark">
              <IconUser className="h-5 w-5" />
            </span>
            <span className="hidden flex-col items-start leading-tight lg:flex">
              <span className="text-[11px] text-muted">سلام،</span>
              <span className="max-w-[140px] truncate text-sm font-semibold text-foreground">
                {displayName}
              </span>
            </span>
          </>
        )}
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute left-0 top-[calc(100%+0.5rem)] z-50 min-w-[220px] overflow-hidden rounded-xl border border-nude-200 bg-white py-2 shadow-lg text-black"
        >
          <div className="border-b border-nude-100 px-4 py-2 text-xs text-black">
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
