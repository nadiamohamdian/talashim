'use client';

import { formatPrice } from '@/shared/lib/format-price';
import type { HomeProductCarouselItem } from '@/shared/config/storefront-ia';
import { StoreProductCardMedia } from '@/shared/ui/store-product-card-media';

interface HomeProductCarouselCardProps {
  item: HomeProductCarouselItem;
}

export function HomeProductCarouselCard({ item }: HomeProductCarouselCardProps) {
  return (
    <>
      <StoreProductCardMedia
        imageUrl={item.imageUrl}
        hoverImageUrl={item.hoverImageUrl}
        alt={item.title}
        sizes="(max-width: 1024px) 45vw, 248px"
      />
      <h3 className="store-product-card-title home-product-carousel-item-title">{item.title}</h3>
      <p className="store-product-card-price home-product-carousel-price">
        {formatPrice(item.priceToman)} <span>تومان</span>
      </p>
      <p className="store-product-card-weight home-product-carousel-weight">
        {item.weightGram.toLocaleString('fa-IR', { maximumFractionDigits: 1 })} گرم
      </p>
    </>
  );
}
