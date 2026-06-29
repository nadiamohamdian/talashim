'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const HERO_SELECTOR = '.home-hero-fullscreen';

export function useHeroHeaderSolid(): boolean {
  const pathname = usePathname();
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const hero = document.querySelector(HERO_SELECTOR);
    if (!hero) {
      setSolid(false);
      return;
    }

    let observer: IntersectionObserver | null = null;

    const setup = (): void => {
      observer?.disconnect();

      const header = document.querySelector('.site-header-menu');
      const headerHeight = header?.getBoundingClientRect().height ?? 64;

      observer = new IntersectionObserver(
        ([entry]) => {
          setSolid(!entry.isIntersecting);
        },
        {
          root: null,
          rootMargin: `-${headerHeight}px 0px 0px 0px`,
          threshold: 0,
        },
      );

      observer.observe(hero);
    };

    setup();
    window.addEventListener('resize', setup, { passive: true });

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', setup);
    };
  }, [pathname]);

  return solid;
}
