'use client';

import { useEffect, useLayoutEffect } from 'react';
import { usePathname } from 'next/navigation';

function scrollWindowToTop(): void {
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

export function ScrollManager(): null {
  const pathname = usePathname();

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const handlePageShow = (event: PageTransitionEvent): void => {
      if (event.persisted) {
        scrollWindowToTop();
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  useLayoutEffect(() => {
    scrollWindowToTop();
  }, [pathname]);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(scrollWindowToTop);
    return () => window.cancelAnimationFrame(frameId);
  }, [pathname]);

  return null;
}
