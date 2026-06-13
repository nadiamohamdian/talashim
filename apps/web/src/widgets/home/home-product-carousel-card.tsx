'use client';

import { formatPrice } from '@/shared/lib/format-price';
import type { HomeProductCarouselItem } from '@/shared/config/storefront-ia';

interface HomeProductCarouselCardProps {
  item: HomeProductCarouselItem;
}

export function HomeProductCarouselCard({ item }: HomeProductCarouselCardProps) {
  const hoverImageUrl = item.hoverImageUrl?.trim();

  return (
    <>
      <div className="home-product-carousel-media">
        <div className="home-product-carousel-media-primary">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
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
              src={hoverImageUrl}
              alt=""
              className="home-product-carousel-image home-product-carousel-image-hover"
              loading="lazy"
              decoding="async"
            />
          </div>
        ) : null}
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
