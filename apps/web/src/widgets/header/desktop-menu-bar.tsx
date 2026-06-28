'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCartHydrated } from '@/features/cart/hooks/use-cart-hydrated';
import { useDisplayCart } from '@/features/cart/hooks/use-display-cart';
import { UserAccountDropdown } from '@/widgets/account/user-account-dropdown';
import { HomeHeroDesktopNav } from '@/widgets/header/main-nav';
import {
  IconMenuBag,
  IconMenuSearch,
} from '@/widgets/header/header-menu-icons';
import { StorefrontSearchBar } from '@/widgets/header/storefront-search-bar';

export function DesktopMenuBar() {
  const cartHydrated = useCartHydrated();
  const { count } = useDisplayCart();
  const cartBadge = cartHydrated && count > 0 ? count : undefined;
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <div className="desktop-menu-bar">
        <div className="desktop-menu-bar-top">
          <div className="desktop-menu-bar-actions">
            <button
              type="button"
              className="desktop-menu-bar-action"
              aria-label="جستجو"
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen((value) => !value)}
            >
              <IconMenuSearch className="desktop-menu-bar-icon desktop-menu-bar-icon-search" />
            </button>

            <UserAccountDropdown variant="menu-icon" surface="desktop" />

            <Link href="/cart" className="desktop-menu-bar-action" aria-label="سبد خرید">
              <IconMenuBag className="desktop-menu-bar-icon desktop-menu-bar-icon-bag" />
              {cartBadge != null ? (
                <span className="desktop-menu-bar-badge">{cartBadge}</span>
              ) : null}
            </Link>
          </div>

          <nav className="desktop-menu-bar-nav" aria-label="دسته‌بندی محصولات">
            <div className="desktop-menu-bar-nav-list">
              <HomeHeroDesktopNav />
            </div>
          </nav>

          <Link href="/" className="desktop-menu-bar-brand" aria-label="Talashim">
            Talashim
          </Link>
        </div>
      </div>

      {searchOpen ? (
        <div className="storefront-search-bar-wrap storefront-search-bar-wrap--header">
          <StorefrontSearchBar
            autoFocus
            onSubmitted={() => setSearchOpen(false)}
          />
        </div>
      ) : null}
    </>
  );
}
