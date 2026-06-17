'use client';

import { CartPanel } from '@/features/cart/components/cart-panel';
import { ThemeProvider } from '@/shared/providers/theme-provider';
import { StorefrontSettingsProvider } from '@/shared/providers/storefront-settings-provider';
import type { StorefrontSettings } from '@/shared/model/storefront-settings';
import type { PublicCmsBanner, PublicCmsStaticPageSummary } from '@sadafgold/types';
import { GlobalBannerBar } from '@/widgets/cms/global-banner-bar';
import { SiteFooter } from '@/widgets/footer/site-footer';
import { SiteHeader } from '@/widgets/header/site-header';
import { QueryProvider } from '@/shared/providers/query-provider';
import { ScrollManager } from '@/shared/providers/scroll-manager';
import { SessionBootstrap } from '@/shared/providers/session-bootstrap';
import type { PropsWithChildren } from 'react';

type ClientRootProps = PropsWithChildren<{
  settings: StorefrontSettings;
  globalBanners?: PublicCmsBanner[];
  staticPages?: PublicCmsStaticPageSummary[];
}>;

export function ClientRoot({
  children,
  settings,
  globalBanners = [],
  staticPages = [],
}: ClientRootProps) {
  return (
    <QueryProvider>
      <SessionBootstrap>
        <StorefrontSettingsProvider value={settings}>
          <ThemeProvider>
            <ScrollManager />
            <div className="flex min-h-full flex-1 flex-col">
              <GlobalBannerBar banners={globalBanners} />
              <SiteHeader />
              <main className="container-store flex-1 py-6 md:py-10">{children}</main>
              <SiteFooter staticPages={staticPages} />
              <CartPanel />
            </div>
          </ThemeProvider>
        </StorefrontSettingsProvider>
      </SessionBootstrap>
    </QueryProvider>
  );
}
