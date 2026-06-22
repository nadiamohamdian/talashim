'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { AccountLogoutDialog } from '@/features/auth/components/account-logout-dialog';
import { resolveProfileDisplayName, resolveProfilePhone } from '@/features/account/lib/profile-display';
import { useProfile } from '@/features/account/hooks/use-profile';
import { useAuth, useLogoutMutation } from '@/features/auth/hooks/use-auth';
import { useFeatureFlag } from '@/shared/providers/storefront-settings-provider';
import { toPersianDigits } from '@/shared/lib/to-persian-digits';
import { buildLoginHref } from '@/shared/routing/safe-redirect';
import { IconAccountSidebarAvatar, IconAccountSidebarLogout } from '@/widgets/account/account-sidebar-icons';
import { useAccountSidebarNavItems } from '@/widgets/account/account-sidebar-nav';
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

function MobileAccountMenuPanel({
  onNavigate,
  onClose,
}: {
  onNavigate: () => void;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const navItems = useAccountSidebarNavItems();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const logoutMutation = useLogoutMutation();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const displayName =
    resolveProfileDisplayName(profile) || user?.fullName || 'نام و نام خانوادگی کاربر';
  const phone = resolveProfilePhone(profile);
  const displayPhone = phone ? toPersianDigits(phone) : null;

  return (
    <>
      <div className="user-account-dropdown-panel" role="menu" aria-label="حساب کاربری">
        <p className="user-account-dropdown-panel-title">حساب کاربری</p>

        <div className="user-account-dropdown-profile">
          <div className="user-account-dropdown-avatar" aria-hidden="true">
            <IconAccountSidebarAvatar className="user-account-dropdown-avatar-icon" />
          </div>
          <div className="user-account-dropdown-profile-copy">
            <p className="user-account-dropdown-name">{displayName}</p>
            {displayPhone ? <p className="user-account-dropdown-phone">{displayPhone}</p> : null}
          </div>
        </div>

        <nav className="user-account-dropdown-nav" aria-label="منوی حساب کاربری">
          {navItems.map((item) => {
            const active = item.isActive(pathname);
            const Icon = item.icon;

            return (
              <div key={item.label} className="user-account-dropdown-nav-group">
                <span className="user-account-dropdown-divider" aria-hidden="true" />
                <Link
                  href={item.href}
                  role="menuitem"
                  onClick={onNavigate}
                  className={`user-account-dropdown-link${active ? ' is-active' : ''}`}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className="user-account-dropdown-link-icon" />
                  <span>{item.label}</span>
                </Link>
              </div>
            );
          })}

          <span className="user-account-dropdown-divider" aria-hidden="true" />

          <button
            type="button"
            role="menuitem"
            className="user-account-dropdown-logout"
            disabled={logoutMutation.isPending}
            onClick={() => setLogoutDialogOpen(true)}
          >
            <IconAccountSidebarLogout className="user-account-dropdown-link-icon" />
            <span>{logoutMutation.isPending ? 'در حال خروج...' : 'خروج از حساب کاربری'}</span>
          </button>
        </nav>
      </div>

      <AccountLogoutDialog
        open={logoutDialogOpen}
        isPending={logoutMutation.isPending}
        onClose={() => setLogoutDialogOpen(false)}
        onConfirm={() => {
          onClose();
          logoutMutation.mutate();
        }}
      />
    </>
  );
}

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
  const isMobileMenuIcon = variant === 'menu-icon' && surface === 'mobile';

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
        isMobileMenuIcon ? (
          <MobileAccountMenuPanel
            onNavigate={() => setOpen(false)}
            onClose={() => setOpen(false)}
          />
        ) : (
          <div
            role="menu"
            className="absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-[220px] overflow-hidden rounded-xl border border-nude-200 bg-white py-2 text-right shadow-lg text-black"
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
        )
      ) : null}
    </div>
  );
}
