'use client';

import { StoreImage } from '@/shared/ui/store-image';
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
          <StoreImage
            src={item.imageUrl}
            alt={item.title}
            fill
            className="home-product-carousel-image home-product-carousel-image-primary"
            sizes="152px"
          />
        </div>
        {hoverImageUrl ? (
          <div className="home-product-carousel-media-hover" aria-hidden>
            <StoreImage
              src={hoverImageUrl}
              alt=""
              fill
              className="home-product-carousel-image home-product-carousel-image-hover"
              sizes="152px"
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
