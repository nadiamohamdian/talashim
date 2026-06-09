'use client';

import { useStorefrontSettings } from '@/shared/providers/storefront-settings-provider';
import { DesktopMenuBar } from '@/widgets/header/desktop-menu-bar';
import { MobileMenuBar } from '@/widgets/header/mobile-menu-bar';

export function SiteHeader() {
  const { gold } = useStorefrontSettings();
  const headerTopClass = gold.showGoldTickerInHeader ? 'top-10' : 'top-0';

  return (
    <header className={`site-header-menu sticky z-40 ${headerTopClass}`}>
      <div className="site-header-menu-inner lg:hidden">
        <MobileMenuBar />
      </div>
      <div className="hidden lg:block">
        <DesktopMenuBar />
      </div>
    </header>
  );
}
