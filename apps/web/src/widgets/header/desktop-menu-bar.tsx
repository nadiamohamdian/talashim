'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useCartHydrated } from '@/features/cart/hooks/use-cart-hydrated';
import { useDisplayCart } from '@/features/cart/hooks/use-display-cart';
import { UserAccountDropdown } from '@/widgets/account/user-account-dropdown';
import { CategoryNavMenu, HomeHeroDesktopNav, MainNavLinks } from '@/widgets/header/main-nav';
import {
  IconMenuBag,
  IconMenuSearch,
} from '@/widgets/header/header-menu-icons';
import { StoreSearchBar } from '@/widgets/header/store-search-bar';

export function DesktopMenuBar() {
  const pathname = usePathname();
  const isHomeHero = pathname === '/';
  const cartHydrated = useCartHydrated();
  const { count } = useDisplayCart();
  const cartBadge = cartHydrated && count > 0 ? count : undefined;
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="desktop-menu-bar">
      <div className="container-store desktop-menu-bar-top">
        <Link href="/" className="desktop-menu-bar-brand" aria-label="Talashim">
          Talashim
        </Link>

        <nav
          className={isHomeHero ? 'desktop-menu-bar-nav desktop-menu-bar-nav-hero' : 'desktop-menu-bar-nav'}
          aria-label={isHomeHero ? 'دسته‌بندی محصولات' : 'منوی اصلی'}
        >
          {isHomeHero ? <HomeHeroDesktopNav /> : <MainNavLinks />}
        </nav>

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
      </div>

      {searchOpen ? (
        <div className="container-store desktop-menu-bar-search">
          <StoreSearchBar />
        </div>
      ) : null}

      {!isHomeHero ? (
        <div className="desktop-menu-bar-sub">
          <div className="container-store desktop-menu-bar-sub-inner">
            <CategoryNavMenu />
            <Link href="/products?sale=1" className="desktop-menu-bar-sale">
              تخفیف‌های روز
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
