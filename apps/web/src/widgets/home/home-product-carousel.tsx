'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef } from 'react';
import type { HomeProductCarouselItem } from '@/shared/config/storefront-ia';
import { HomeProductCarouselCard } from '@/widgets/home/home-product-carousel-card';

export interface HomeProductCarouselProps {
  id: string;
  title: string;
  watermark: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  items: readonly HomeProductCarouselItem[];
  className?: string;
}

export function HomeProductCarousel({
  id,
  title,
  watermark,
  viewAllHref = '/products',
  viewAllLabel = 'نمایش همه',
  items,
  className,
}: HomeProductCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) {
      return;
    }

    if (getComputedStyle(track).direction === 'rtl') {
      track.scrollLeft = 0;
    }
  }, [items]);

  const scrollTrack = useCallback((direction: 'prev' | 'next') => {
    const track = trackRef.current;
    if (!track) {
      return;
    }

    const firstCard = track.querySelector<HTMLElement>('.home-product-carousel-card');
    if (!firstCard) {
      return;
    }

    const trackStyles = getComputedStyle(track);
    const gap = Number.parseFloat(trackStyles.columnGap || trackStyles.gap || '0') || 0;
    const scrollAmount = firstCard.offsetWidth + gap;

    track.scrollBy({
      left: direction === 'next' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  }, []);

  return (
    <section
      className={className ? `home-product-carousel ${className}` : 'home-product-carousel'}
      aria-labelledby={id}
    >
      <div className="home-product-carousel-inner">
        <div className="home-product-carousel-header">
          <div className="home-product-carousel-heading">
            <span className="home-product-carousel-watermark" aria-hidden>
              {watermark}
            </span>
            <h2 id={id} className="home-product-carousel-title">
              {title}
            </h2>
          </div>

          <div className="home-product-carousel-actions">
            <div className="home-product-carousel-nav" aria-label="پیمایش محصولات">
              <button
                type="button"
                className="home-product-carousel-nav-btn home-product-carousel-nav-btn--prev"
                onClick={() => scrollTrack('prev')}
                aria-label="محصولات قبلی"
              >
                <IconCarouselArrow direction="prev" />
              </button>
              <button
                type="button"
                className="home-product-carousel-nav-btn home-product-carousel-nav-btn--next"
                onClick={() => scrollTrack('next')}
                aria-label="محصولات بعدی"
              >
                <IconCarouselArrow direction="next" />
              </button>
            </div>

            <Link href={viewAllHref} className="home-product-carousel-view-all">
              {viewAllLabel}
            </Link>
          </div>
        </div>

        <div ref={trackRef} className="home-product-carousel-track" role="list">
          {items.map((item) => (
            <article key={item.id} className="home-product-carousel-card" role="listitem">
              {item.href ? (
                <Link href={item.href} className="home-product-carousel-card-link">
                  <HomeProductCarouselCard item={item} />
                </Link>
              ) : (
                <div className="home-product-carousel-card-link">
                  <HomeProductCarouselCard item={item} />
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function IconCarouselArrow({ direction }: { direction: 'prev' | 'next' }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/images/home/carousel-nav-arrow.png"
      alt=""
      aria-hidden
      className={`home-product-carousel-nav-icon home-product-carousel-nav-icon--${direction}`}
      decoding="async"
    />
  );
}
