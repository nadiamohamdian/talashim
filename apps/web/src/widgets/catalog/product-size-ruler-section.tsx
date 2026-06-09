'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { toPersianDigits } from '@/shared/lib/to-persian-digits';

interface ProductSizeRulerSectionProps {
  id: string;
  title: string;
  guideHref: string;
  sizes: number[];
  selectedSize: number;
  onSelectSize: (size: number) => void;
  className?: string;
}

export function ProductSizeRulerSection({
  id,
  title,
  guideHref,
  sizes,
  selectedSize,
  onSelectSize,
  className,
}: ProductSizeRulerSectionProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef(new Map<number, HTMLButtonElement>());

  useEffect(() => {
    const track = trackRef.current;
    const item = itemRefs.current.get(selectedSize);
    if (!track || !item) {
      return;
    }

    const targetScroll = item.offsetLeft - track.clientWidth / 2 + item.offsetWidth / 2;
    track.scrollTo({ left: targetScroll, behavior: 'smooth' });
  }, [selectedSize, sizes]);

  return (
    <section className={className} aria-labelledby={id}>
      <div className="product-details-section-head">
        <h2 id={id} className="product-details-section-title">
          {title}
        </h2>
        <Link href={guideHref} className="product-details-link">
          راهنمای انتخاب سایز
        </Link>
      </div>

      <div className="product-details-ruler-wrap">
        <div className="product-details-ruler">
          <span className="product-details-ruler-pointer" aria-hidden />
          <div ref={trackRef} className="product-details-ruler-track">
            {sizes.map((size) => (
              <button
                key={size}
                ref={(element) => {
                  if (element) {
                    itemRefs.current.set(size, element);
                  } else {
                    itemRefs.current.delete(size);
                  }
                }}
                type="button"
                data-size={size}
                className={
                  selectedSize === size
                    ? 'product-details-ruler-item is-active'
                    : 'product-details-ruler-item'
                }
                onClick={() => onSelectSize(size)}
              >
                <span className="product-details-ruler-num">{toPersianDigits(size)}</span>
                <span className="product-details-ruler-tick" aria-hidden />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
