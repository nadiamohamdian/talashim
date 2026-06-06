'use client';

import Link from 'next/link';
import { useStorefrontSettings } from '@/shared/providers/storefront-settings-provider';
import { CategoryNavMenu, MainNavLinks } from '@/widgets/header/main-nav';
import { HeaderActions } from '@/widgets/header/header-actions';
import { StoreSearchBar } from '@/widgets/header/store-search-bar';

export function SiteHeader() {
  const { general } = useStorefrontSettings();

  return (
    <header className="header-glass sticky top-0 z-40 border-b border-nude-200/90 shadow-[var(--shadow-soft)]">
      <div className="container-store flex items-center gap-5 py-4">
        <Link href="/" className="group shrink-0">
          <span className="block text-xs font-medium tracking-[0.2em] text-gold-dark/80">
            GALLERY
          </span>
          <span className="text-xl font-bold tracking-tight text-foreground transition group-hover:text-gold-dark md:text-2xl">
            {general.storeName}
          </span>
          {general.tagline ? (
            <span className="mt-0.5 block text-xs text-muted">{general.tagline}</span>
          ) : null}
        </Link>
        <StoreSearchBar className="hidden flex-1 md:flex" />
        <HeaderActions />
      </div>

      <div className="border-t border-nude-100 bg-nude-50/60">
        <div className="container-store flex flex-wrap items-center gap-2 py-2.5 md:gap-3">
          <CategoryNavMenu />
          <MainNavLinks className="hidden lg:flex" />
          <Link href="/products?sale=1" className="btn-gold mr-auto px-4 py-2 text-xs md:text-sm">
            تخفیف‌های روز
          </Link>
        </div>
      </div>

      <div className="border-t border-nude-100 px-4 py-3 md:hidden">
        <StoreSearchBar />
      </div>
    </header>
  );
}
