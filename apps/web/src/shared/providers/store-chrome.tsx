'use client';

import { CartPanel } from '@/features/cart/components/cart-panel';
import { useStorefrontSettings } from '@/shared/providers/storefront-settings-provider';
import { SiteFooter } from '@/widgets/footer/site-footer';
import { GoldPriceTicker } from '@/widgets/header/gold-price-ticker';
import { SiteHeader } from '@/widgets/header/site-header';
import type { PropsWithChildren } from 'react';

export function StoreChrome({ children }: PropsWithChildren) {
  const { gold } = useStorefrontSettings();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      {gold.showGoldTickerInHeader ? <GoldPriceTicker /> : null}
      <SiteHeader />
      <main className="container-store flex-1 py-6 md:py-10">{children}</main>
      <SiteFooter />
      <CartPanel />
    </div>
  );
}
