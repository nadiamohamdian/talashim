'use client';

import { DesktopMenuBar } from '@/widgets/header/desktop-menu-bar';
import { MobileMenuBar } from '@/widgets/header/mobile-menu-bar';
import { useHeroHeaderSolid } from '@/widgets/header/use-hero-header-solid';

export function SiteHeader() {
  const heroHeaderSolid = useHeroHeaderSolid();

  return (
    <header
      className={`site-header-menu sticky top-0 z-[60] w-full${heroHeaderSolid ? ' site-header-menu--solid' : ''}`}
    >
      <div className="site-header-menu-inner site-header-minimal-bar lg:hidden">
        <MobileMenuBar />
      </div>
      <div className="site-header-menu-inner site-header-desktop-bar hidden lg:block">
        <DesktopMenuBar />
      </div>
    </header>
  );
}
