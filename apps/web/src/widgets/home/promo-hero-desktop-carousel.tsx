'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { HomeHeroDesktopCarouselItem } from '@/shared/config/storefront-ia';

interface PromoHeroDesktopCarouselProps {
  items: HomeHeroDesktopCarouselItem[];
}

const VISIBLE_COUNT = 3;

export function PromoHeroDesktopCarousel({ items }: PromoHeroDesktopCarouselProps) {
  const [offset, setOffset] = useState(0);
  const slideCount = items.length;

  if (slideCount === 0) {
    return null;
  }

  const visibleItems = Array.from({ length: Math.min(VISIBLE_COUNT, slideCount) }, (_, index) => {
    return items[(offset + index) % slideCount];
  });

  const goPrev = () => {
    setOffset((current) => (current - 1 + slideCount) % slideCount);
  };

  const goNext = () => {
    setOffset((current) => (current + 1) % slideCount);
  };

  return (
    <div className="promo-hero-desktop-carousel">
      <button
        type="button"
        className="promo-hero-desktop-carousel-nav promo-hero-desktop-carousel-nav-prev"
        onClick={goPrev}
        aria-label="محصول قبلی"
      >
        <IconCarouselArrow direction="prev" />
      </button>

      <div className="promo-hero-desktop-carousel-track" role="list">
        {visibleItems.map((item) => (
          <Link
            key={item.id}
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
