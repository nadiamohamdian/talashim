'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCartHydrated } from '@/features/cart/hooks/use-cart-hydrated';
import { useDisplayCart } from '@/features/cart/hooks/use-display-cart';
import { UserAccountDropdown } from '@/widgets/account/user-account-dropdown';
import {
  IconMenuBag,
  IconMenuHamburger,
  IconMenuSearch,
} from '@/widgets/header/header-menu-icons';
import { MobileNavDrawer } from '@/widgets/header/mobile-nav-drawer';

export function MobileMenuBar() {
  const [navOpen, setNavOpen] = useState(false);
  const cartHydrated = useCartHydrated();
  const { count } = useDisplayCart();
  const cartBadge = cartHydrated && count > 0 ? count : undefined;

  return (
    <>
      <div className="mobile-menu-bar">
        <Link href="/" className="mobile-menu-bar-brand" aria-label="Talashim">
          Talashim
        </Link>

        <div className="mobile-menu-bar-actions">
          <Link href="/search" className="mobile-menu-bar-action" aria-label="جستجو">
            <IconMenuSearch className="mobile-menu-bar-icon mobile-menu-bar-icon-search" />
          </Link>

          <UserAccountDropdown variant="menu-icon" />

          <Link href="/cart" className="mobile-menu-bar-action" aria-label="سبد خرید">
            <IconMenuBag className="mobile-menu-bar-icon mobile-menu-bar-icon-bag" />
            {cartBadge != null ? (
              <span className="mobile-menu-bar-badge">{cartBadge}</span>
            ) : null}
          </Link>

          <button
            type="button"
            className="mobile-menu-bar-action"
            aria-label="منو"
            aria-expanded={navOpen}
            onClick={() => setNavOpen(true)}
          >
            <IconMenuHamburger className="mobile-menu-bar-icon mobile-menu-bar-icon-menu" />
          </button>
        </div>
      </div>

      <MobileNavDrawer open={navOpen} onClose={() => setNavOpen(false)} />
    </>
  );
}
