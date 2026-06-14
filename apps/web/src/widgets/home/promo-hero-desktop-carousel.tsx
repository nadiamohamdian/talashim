'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  HOME_HERO_DESKTOP_CAROUSEL_VISIBLE_COUNT,
  type HomeHeroDesktopCarouselItem,
} from '@/shared/config/storefront-ia';

interface PromoHeroDesktopCarouselProps {
  items: HomeHeroDesktopCarouselItem[];
}

export function PromoHeroDesktopCarousel({ items }: PromoHeroDesktopCarouselProps) {
  const [offset, setOffset] = useState(0);
  const slideCount = items.length;
  const visibleCount = Math.min(HOME_HERO_DESKTOP_CAROUSEL_VISIBLE_COUNT, slideCount);
  const canNavigate = slideCount > HOME_HERO_DESKTOP_CAROUSEL_VISIBLE_COUNT;

  if (slideCount === 0) {
    return null;
  }

  const visibleItems = Array.from({ length: visibleCount }, (_, index) => {
    return items[(offset + index) % slideCount];
  });

  const goPrev = () => {
    if (!canNavigate) {
      return;
    }
    setOffset((current) => (current - 1 + slideCount) % slideCount);
  };

  const goNext = () => {
    if (!canNavigate) {
      return;
    }
    setOffset((current) => (current + 1) % slideCount);
  };

  return (
    <div className="promo-hero-desktop-carousel">
      <button
        type="button"
        className="promo-hero-desktop-carousel-nav promo-hero-desktop-carousel-nav-prev"
        onClick={goPrev}
        aria-label="محصول قبلی"
        disabled={!canNavigate}
        hidden={!canNavigate}
      >
        <IconCarouselArrow direction="prev" />
      </button>

      <div className="promo-hero-desktop-carousel-track" role="list">
        {visibleItems.map((item, index) => (
          <Link
            key={`${item.id}-${offset}-${index}`}
            href={item.href}
            className="promo-hero-desktop-carousel-item"
            role="listitem"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.imageUrl} alt="" className="promo-hero-desktop-carousel-image" />
          </Link>
        ))}
      </div>

      <button
        type="button"
        className="promo-hero-desktop-carousel-nav promo-hero-desktop-carousel-nav-next"
        onClick={goNext}
        aria-label="محصول بعدی"
        disabled={!canNavigate}
        hidden={!canNavigate}
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
