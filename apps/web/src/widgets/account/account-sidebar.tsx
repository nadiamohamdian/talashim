'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { AccountLogoutDialog } from '@/features/auth/components/account-logout-dialog';
import { useAuth, useLogoutMutation } from '@/features/auth/hooks/use-auth';
import { resolveProfileDisplayName, resolveProfilePhone } from '@/features/account/lib/profile-display';
import { useProfile } from '@/features/account/hooks/use-profile';
import { toPersianDigits } from '@/shared/lib/to-persian-digits';
import {
  IconAccountSidebarAvatar,
  IconAccountSidebarLogout,
  IconAccountSidebarOrders,
  IconAccountSidebarProfile,
  IconAccountSidebarTracking,
} from '@/widgets/account/account-sidebar-icons';

const SIDEBAR_NAV_ITEMS = [
  {
    href: '/orders',
    label: 'سفارش ها',
    icon: IconAccountSidebarOrders,
    isActive: (pathname: string) => pathname === '/orders',
  },
  {
    href: '/orders',
    label: 'پیگیری سفارش',
    icon: IconAccountSidebarTracking,
    isActive: (pathname: string) =>
      pathname.startsWith('/orders/') || pathname.startsWith('/checkout/track/'),
  },
  {
    href: '/profile',
    label: 'اطلاعات کاربری',
    icon: IconAccountSidebarProfile,
    isActive: (pathname: string) =>
      pathname === '/profile' || pathname.startsWith('/profile/'),
  },
] as const;

export function AccountSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const logoutMutation = useLogoutMutation();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const displayName =
    resolveProfileDisplayName(profile) || user?.fullName || 'نام و نام خانوادگی کاربر';
  const phone = resolveProfilePhone(profile);
  const displayPhone = phone ? toPersianDigits(phone) : null;

  return (
    <aside className="account-page-sidebar" aria-label="حساب کاربری">
      <h2 className="account-page-sidebar-title">حساب کاربری</h2>

      <div className="account-page-sidebar-profile">
        <div className="account-page-sidebar-avatar" aria-hidden="true">
          <IconAccountSidebarAvatar className="account-page-sidebar-avatar-icon" />
        </div>
        <div className="account-page-sidebar-profile-copy">
          <p className="account-page-sidebar-name">{displayName}</p>
          {displayPhone ? <p className="account-page-sidebar-phone">{displayPhone}</p> : null}
        </div>
      </div>

      <nav className="account-page-sidebar-nav" aria-label="منوی حساب کاربری">
        {SIDEBAR_NAV_ITEMS.map((item, index) => {
          const active = item.isActive(pathname);
          const Icon = item.icon;

          return (
            <div key={item.label} className="account-page-sidebar-nav-group">
              {index > 1 ? <span className="account-page-sidebar-divider" aria-hidden="true" /> : null}
              <Link
                href={item.href}
                className={`account-page-sidebar-link${active ? ' is-active' : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="account-page-sidebar-link-icon" />
                <span className="account-page-sidebar-link-label">{item.label}</span>
              </Link>
            </div>
          );
        })}

        <span className="account-page-sidebar-divider" aria-hidden="true" />

        <button
          type="button"
          className="account-page-sidebar-logout"
          disabled={logoutMutation.isPending}
          onClick={() => setLogoutDialogOpen(true)}
        >
          <IconAccountSidebarLogout className="account-page-sidebar-link-icon" />
          <span className="account-page-sidebar-link-label">خروج از حساب کاربری</span>
        </button>
      </nav>

      <AccountLogoutDialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        onConfirm={() => {
          setLogoutDialogOpen(false);
          logoutMutation.mutate();
        }}
      />
    </aside>
  );
}
