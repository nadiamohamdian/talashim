'use client';

import { useState } from 'react';
import { StoreImage } from '@/shared/ui/store-image';

interface ProductListingHeroCarouselProps {
  slides: readonly string[];
}

export function ProductListingHeroCarousel({ slides }: ProductListingHeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(slides.length - 1);

  return (
    <section className="product-listing-carousel" aria-label="اسلاید محصولات">
      <div className="product-listing-carousel-frame">
        <StoreImage
          src={slides[activeIndex] ?? slides[0]!}
          alt=""
          fill
          className="product-listing-carousel-image"
          sizes="370px"
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
