'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { AccountLogoutDialog } from '@/features/auth/components/account-logout-dialog';
import { useAuth, useLogoutMutation } from '@/features/auth/hooks/use-auth';
import { resolveProfileDisplayName, resolveProfilePhone } from '@/features/account/lib/profile-display';
import { useProfile } from '@/features/account/hooks/use-profile';
import { toPersianDigits } from '@/shared/lib/to-persian-digits';
import { IconAccountSidebarLogout } from '@/widgets/account/account-sidebar-icons';
import { useAccountSidebarNavItems } from '@/widgets/account/account-sidebar-nav';

export function AccountMobileHub() {
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
    <div className="account-mobile-hub">
      <h1 className="account-mobile-hub-title">حساب کاربری</h1>

      <div className="account-mobile-hub-profile">
        <div className="account-mobile-hub-avatar" aria-hidden="true">
          <svg viewBox="0 0 50 50" fill="none" aria-hidden="true">
            <circle cx="25" cy="18" r="6.5" stroke="currentColor" strokeWidth="1" />
            <path
              d="M12 40c2.4-8.2 20.6-8.2 26 0"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="account-mobile-hub-profile-copy">
          <p className="account-mobile-hub-name">{displayName}</p>
          {displayPhone ? <p className="account-mobile-hub-phone">{displayPhone}</p> : null}
        </div>
      </div>

      <nav className="account-mobile-hub-nav" aria-label="منوی حساب کاربری">
        {navItems.map((item) => {
          const active = item.isActive(pathname);
          const Icon = item.icon;

          return (
            <div key={item.label} className="account-mobile-hub-nav-group">
              <span className="account-mobile-hub-divider" aria-hidden="true" />
              <Link
                href={item.href}
                className={`account-mobile-hub-link${active ? ' is-active' : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="account-mobile-hub-link-icon" />
                <span>{item.label}</span>
              </Link>
            </div>
          );
        })}

        <span className="account-mobile-hub-divider" aria-hidden="true" />

        <button
          type="button"
          className="account-mobile-hub-logout"
          disabled={logoutMutation.isPending}
          onClick={() => setLogoutDialogOpen(true)}
        >
          <IconAccountSidebarLogout className="account-mobile-hub-link-icon" />
          <span>خروج از حساب کاربری</span>
        </button>
      </nav>

      <AccountLogoutDialog
        open={logoutDialogOpen}
        isPending={logoutMutation.isPending}
        onClose={() => setLogoutDialogOpen(false)}
        onConfirm={() => logoutMutation.mutate()}
      />
    </div>
  );

}
