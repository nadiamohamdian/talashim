'use client';

import { useMemo } from 'react';
import type { ComponentType, SVGProps } from 'react';
import { useFeatureFlag } from '@/shared/providers/storefront-settings-provider';
import {
  IconAccountSidebarAddresses,
  IconAccountSidebarInvoices,
  IconAccountSidebarOrders,
  IconAccountSidebarPassword,
  IconAccountSidebarProfile,
  IconAccountSidebarTracking,
  IconAccountSidebarWishlist,
} from '@/widgets/account/account-sidebar-icons';

export type AccountSidebarNavItem = {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  isActive: (pathname: string) => boolean;
};

export function buildAccountSidebarNavItems(wishlistEnabled: boolean): AccountSidebarNavItem[] {
  const items: AccountSidebarNavItem[] = [
    {
      href: '/orders',
      label: 'سفارش ها',
      icon: IconAccountSidebarOrders,
      isActive: (pathname) => pathname === '/orders',
    },
    {
      href: '/orders',
      label: 'پیگیری سفارش',
      icon: IconAccountSidebarTracking,
      isActive: (pathname) =>
        pathname.startsWith('/orders/') || pathname.startsWith('/checkout/track/'),
    },
    {
      href: '/invoices',
      label: 'فاکتورها',
      icon: IconAccountSidebarInvoices,
      isActive: (pathname) =>
        pathname === '/invoices' || pathname.startsWith('/orders/') && pathname.endsWith('/invoice'),
    },
    {
      href: '/addresses',
      label: 'آدرس ها',
      icon: IconAccountSidebarAddresses,
      isActive: (pathname) => pathname === '/addresses' || pathname.startsWith('/addresses/'),
    },
  ];

  if (wishlistEnabled) {
    items.push({
      href: '/wishlist',
      label: 'علاقه مندی ها',
      icon: IconAccountSidebarWishlist,
      isActive: (pathname) => pathname === '/wishlist' || pathname.startsWith('/wishlist/'),
    });
  }

  items.push({
    href: '/profile/info',
    label: 'اطلاعات کاربری',
    icon: IconAccountSidebarProfile,
    isActive: (pathname) =>
      pathname === '/profile/info' || pathname.startsWith('/profile/info/'),
  });

  items.push({
    href: '/profile/password',
    label: 'رمز عبور',
    icon: IconAccountSidebarPassword,
    isActive: (pathname) =>
      pathname === '/profile/password' || pathname.startsWith('/profile/password/'),
  });

  return items;
}

export function useAccountSidebarNavItems(): AccountSidebarNavItem[] {
  const wishlistEnabled = useFeatureFlag('enableWishlist');

  return useMemo(() => buildAccountSidebarNavItems(wishlistEnabled), [wishlistEnabled]);
}
