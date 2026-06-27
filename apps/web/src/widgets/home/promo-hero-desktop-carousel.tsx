'use client';

import Link from 'next/link';
import { useCallback, useRef, useState } from 'react';
import {
  HOME_HERO_DESKTOP_CAROUSEL_VISIBLE_COUNT,
  type HomeHeroDesktopCarouselItem,
} from '@/shared/config/storefront-ia';
import { useCarouselPointerSwipe } from '@/shared/lib/horizontal-scroll-drag';

interface PromoHeroDesktopCarouselProps {
  items: HomeHeroDesktopCarouselItem[];
}

export function PromoHeroDesktopCarousel({ items }: PromoHeroDesktopCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const slideCount = items.length;
  const visibleCount = Math.min(HOME_HERO_DESKTOP_CAROUSEL_VISIBLE_COUNT, slideCount);
  const canNavigate = slideCount > HOME_HERO_DESKTOP_CAROUSEL_VISIBLE_COUNT;

  const goPrev = useCallback(() => {
    if (!canNavigate) {
      return;
    }
    setOffset((current) => (current - 1 + slideCount) % slideCount);
  }, [canNavigate, slideCount]);

  const goNext = useCallback(() => {
    if (!canNavigate) {
      return;
    }
    setOffset((current) => (current + 1) % slideCount);
  }, [canNavigate, slideCount]);

  useCarouselPointerSwipe(trackRef, {
    enabled: canNavigate,
    onSwipeNext: goNext,
    onSwipePrev: goPrev,
  });

  if (slideCount === 0) {
    return null;
  }

  const visibleItems = Array.from({ length: visibleCount }, (_, index) => {
    return items[(offset + index) % slideCount]!;
  });

  return (
    <div className="promo-hero-desktop-carousel">
      <button
        type="button"
        className="promo-hero-desktop-carousel-nav promo-hero-desktop-carousel-nav-prev"
        onClick={goPrev}
        aria-label="محصول قبلی"
        disabled={!canNavigate}
        data-carousel-control
      >
        <IconCarouselArrow direction="prev" />
      </button>

      <div
        ref={trackRef}
        className="promo-hero-desktop-carousel-track store-carousel-scroll"
        role="list"
      >
        {visibleItems.map((item, index) => (
          <Link
            key={`${item.id}-${offset}-${index}`}
            href={item.href}
            className="promo-hero-desktop-carousel-item"
            role="listitem"
            draggable={false}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.imageUrl}
              alt=""
              className="promo-hero-desktop-carousel-image"
              draggable={false}
            />
          </Link>
        ))}
      </div>

      <button
        type="button"
        className="promo-hero-desktop-carousel-nav promo-hero-desktop-carousel-nav-next"
        onClick={goNext}
        aria-label="محصول بعدی"
        disabled={!canNavigate}
        data-carousel-control
      >
        <IconCarouselArrow direction="next" />
      </button>
    </div>
  );
}

function IconCarouselArrow({ direction }: { direction: 'prev' | 'next' }) {
  return (
    <svg viewBox="0 0 8 14" fill="none" aria-hidden className="promo-hero-desktop-carousel-arrow">
      {direction === 'prev' ? (
        <path
          d="M7 1L1 7L7 13"
          stroke="currentColor"
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M1 1L7 7L1 13"
          stroke="currentColor"
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}
