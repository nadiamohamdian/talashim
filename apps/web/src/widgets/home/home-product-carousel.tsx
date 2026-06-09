'use client';

import Link from 'next/link';
import type { HomeProductCarouselItem } from '@/shared/config/storefront-ia';
import { HomeProductCarouselCard } from '@/widgets/home/home-product-carousel-card';

export interface HomeProductCarouselProps {
  id: string;
  title: string;
  watermark: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  items: readonly HomeProductCarouselItem[];
}

export function HomeProductCarousel({
  id,
  title,
  watermark,
  viewAllHref = '/products',
  viewAllLabel = 'نمایش همه',
  items,
}: HomeProductCarouselProps) {
  return (
    <section className="home-product-carousel" aria-labelledby={id}>
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

          <Link href={viewAllHref} className="home-product-carousel-view-all">
            {viewAllLabel}
          </Link>
        </div>

        <div className="home-product-carousel-track" role="list">
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
