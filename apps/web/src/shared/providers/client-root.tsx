'use client';

import { CartPanel } from '@/features/cart/components/cart-panel';
import { ThemeProvider } from '@/shared/providers/theme-provider';
import { SiteFooter } from '@/widgets/footer/site-footer';
import { GoldPriceTicker } from '@/widgets/header/gold-price-ticker';
import { SiteHeader } from '@/widgets/header/site-header';
import { QueryProvider } from '@sadafgold/ui/providers/query-provider';
import type { PropsWithChildren } from 'react';

export function ClientRoot({ children }: PropsWithChildren) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <div className="flex min-h-full flex-1 flex-col">
          <GoldPriceTicker />
          <SiteHeader />
          <main className="container-store flex-1 py-6 md:py-10">{children}</main>
          <SiteFooter />
          <CartPanel />
        </div>
      </ThemeProvider>
    </QueryProvider>
  );
}
