'use client';

import { DesktopMenuBar } from '@/widgets/header/desktop-menu-bar';
import { MobileMenuBar } from '@/widgets/header/mobile-menu-bar';

export function SiteHeader() {
  return (
    <header className="site-header-menu sticky top-0 z-40">
      <div className="site-header-menu-inner site-header-minimal-bar lg:hidden">
        <MobileMenuBar />
      </div>
      <div className="site-header-menu-inner site-header-desktop-bar hidden lg:block">
        <DesktopMenuBar />
      </div>
    </header>
  );
}
