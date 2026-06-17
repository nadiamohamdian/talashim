'use client';

import { CartPanel } from '@/features/cart/components/cart-panel';
import { SiteFooter } from '@/widgets/footer/site-footer';
import { SiteHeader } from '@/widgets/header/site-header';
import type { PropsWithChildren } from 'react';

export function StoreChrome({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <main className="container-store flex-1 py-6 md:py-10">{children}</main>
      <SiteFooter />
      <CartPanel />
    </div>
  );
}
