'use client';

import { useState } from 'react';
import { StoreImage } from '@/shared/ui/store-image';

interface ProductListingHeroCarouselProps {
  slides: readonly string[];
}

export function ProductListingHeroCarousel({ slides }: ProductListingHeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(slides.length > 0 ? slides.length - 1 : 0);

  if (slides.length === 0) {
    return null;
  }
  const activeSlide = slides[activeIndex] ?? slides[0];
  if (!activeSlide) {
    return null;
  }

  return (
    <section className="product-listing-carousel" aria-label="گالری دسته‌بندی">
      <div className="product-listing-carousel-frame">
        <StoreImage
          src={activeSlide}
          alt=""
          fill
          unoptimized
          className="product-listing-carousel-image"
          sizes="(min-width: 1024px) 560px, 370px"
          priority
        />
      </div>

      <div className="product-listing-carousel-dots" role="tablist" aria-label="اسلایدهای بنر">
        {slides.map((_, index) => (
          <button
            key={index}
            type="button"
            role="tab"
            aria-selected={index === activeIndex}
            className={
              index === activeIndex
                ? 'product-listing-carousel-dot is-active'
                : 'product-listing-carousel-dot'
            }
            onClick={() => setActiveIndex(index)}
            aria-label={`اسلاید ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
