'use client';

import { useEffect, useRef } from 'react';
import { formatPrice } from '@/shared/lib/format-price';
import type { HomeProductCarouselItem } from '@/shared/config/storefront-ia';

interface HomeProductCarouselCardProps {
  item: HomeProductCarouselItem;
}

export function HomeProductCarouselCard({ item }: HomeProductCarouselCardProps) {
  const hoverImageUrl = item.hoverImageUrl?.trim();
  const primaryRef = useRef<HTMLImageElement>(null);
  const hoverRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const primary = primaryRef.current;
    const hover = hoverRef.current;

    if (!primary || !hover) {
      return;
    }

    const syncHoverSize = () => {
      const width = primary.offsetWidth;
      const height = primary.offsetHeight;

      if (width <= 0 || height <= 0) {
        return;
      }

      hover.style.width = `${width}px`;
      hover.style.height = `${height}px`;
    };

    syncHoverSize();

    const observer = new ResizeObserver(syncHoverSize);
    observer.observe(primary);
    primary.addEventListener('load', syncHoverSize);
    window.addEventListener('resize', syncHoverSize);

    return () => {
      observer.disconnect();
      primary.removeEventListener('load', syncHoverSize);
      window.removeEventListener('resize', syncHoverSize);
    };
  }, [item.imageUrl, hoverImageUrl]);

  return (
    <>
      <div className="home-product-carousel-media">
        <div className="home-product-carousel-media-frame">
          <div className="home-product-carousel-media-primary">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={primaryRef}
              src={item.imageUrl}
              alt={item.title}
              className="home-product-carousel-image home-product-carousel-image-primary"
              loading="lazy"
              decoding="async"
            />
          </div>
          {hoverImageUrl ? (
            <div className="home-product-carousel-media-hover" aria-hidden>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={hoverRef}
                src={hoverImageUrl}
                alt=""
                className="home-product-carousel-image home-product-carousel-image-hover"
                loading="lazy"
                decoding="async"
              />
            </div>
          ) : null}
        </div>
      </div>
      <h3 className="home-product-carousel-item-title">{item.title}</h3>
      <p className="home-product-carousel-price">
        {formatPrice(item.priceToman)} <span>تومان</span>
      </p>
      <p className="home-product-carousel-weight">
        {item.weightGram.toLocaleString('fa-IR', { maximumFractionDigits: 1 })} گرم
      </p>
    </>
  );
}
