'use client';

import { CartPanel } from '@/features/cart/components/cart-panel';
import { ThemeProvider } from '@/shared/providers/theme-provider';
import { StorefrontSettingsProvider } from '@/shared/providers/storefront-settings-provider';
import type { StorefrontSettings } from '@/shared/model/storefront-settings';
import { SiteFooter } from '@/widgets/footer/site-footer';
import { GoldPriceTicker } from '@/widgets/header/gold-price-ticker';
import { SiteHeader } from '@/widgets/header/site-header';
import { QueryProvider } from '@/shared/providers/query-provider';
import { SessionBootstrap } from '@/shared/providers/session-bootstrap';
import type { PropsWithChildren } from 'react';

type ClientRootProps = PropsWithChildren<{
  settings: StorefrontSettings;
}>;

export function ClientRoot({ children, settings }: ClientRootProps) {
  return (
    <QueryProvider>
      <SessionBootstrap>
        <StorefrontSettingsProvider value={settings}>
          <ThemeProvider>
            <div className="flex min-h-full flex-1 flex-col">
              {settings.gold.showGoldTickerInHeader ? <GoldPriceTicker /> : null}
              <SiteHeader />
              <main className="container-store flex-1 py-6 md:py-10">{children}</main>
              <SiteFooter />
              <CartPanel />
            </div>
          </ThemeProvider>
        </StorefrontSettingsProvider>
      </SessionBootstrap>
    </QueryProvider>
  );
}
