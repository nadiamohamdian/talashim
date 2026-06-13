'use client';

import { useState, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import {
  LENS_EDITORIAL_HERO,
  LENS_EDITORIAL_HOTSPOTS,
  LENS_EDITORIAL_META,
  type LensShowcaseDemoItem,
} from '@/shared/config/lens-showcase-demo';
import { formatPrice } from '@/shared/lib/format-price';
import { StoreImage } from '@/shared/ui/store-image';
import { LensVideoPopup } from '@/widgets/home/lens-video-popup';

interface LensSetsShowcaseProps {
  items: LensShowcaseDemoItem[];
}

export function LensSetsShowcase({ items }: LensSetsShowcaseProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [popupOpen, setPopupOpen] = useState(false);

  const slideCount = items.length;
  const activeItem = items[activeIndex] ?? items[0];
  const spotlightProducts = activeItem?.products.slice(0, LENS_EDITORIAL_HOTSPOTS.length) ?? [];

  const goPrev = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setActiveIndex((index) => (index - 1 + slideCount) % slideCount);
  };

  const goNext = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setActiveIndex((index) => (index + 1) % slideCount);
  };

  const openPopup = () => {
    setPopupOpen(true);
  };

  if (!activeItem) {
    return null;
  }

  const heroImage = activeItem.thumbnailUrl || LENS_EDITORIAL_HERO;

  return (
    <>
      <section className="lens-sets-showcase" aria-labelledby="lens-sets-title">
        <div className="lens-sets-showcase-inner">
          <header className="lens-sets-showcase-intro">
            <p className="lens-sets-showcase-eyebrow">{LENS_EDITORIAL_META.eyebrow}</p>
            <h2 id="lens-sets-title" className="lens-sets-showcase-title">
              {LENS_EDITORIAL_META.title}
            </h2>
          </header>

          <p className="lens-sets-showcase-description">{LENS_EDITORIAL_META.description}</p>

          <div className="lens-sets-showcase-stage">
            <div
              className="lens-sets-showcase-hero"
              role="button"
              tabIndex={0}
              onClick={openPopup}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  openPopup();
                }
              }}
              aria-label="مشاهده لنز طلاشیم"
            >
              <StoreImage
                src={heroImage}
                alt=""
                fill
                unoptimized
                className="lens-sets-showcase-hero-image"
                sizes="(min-width: 1024px) min(691px, 50vw), 350px"
              />
              <span className="lens-sets-showcase-hero-overlay" aria-hidden />

              {spotlightProducts.map((product, index) => (
                <Link
                  key={product.id}
                  href={product.href}
                  className={`lens-sets-showcase-product-chip lens-sets-showcase-product-chip--${index}`}
                  onClick={(event) => event.stopPropagation()}
                >
                  <span className="lens-sets-showcase-product-chip-copy">
                    <span className="lens-sets-showcase-product-chip-title">{product.title}</span>
                    <span className="lens-sets-showcase-product-chip-price">
                      {formatPrice(product.priceToman)} تومان
                    </span>
                    <span className="lens-sets-showcase-product-chip-weight">
                      {product.weightGram} گرم
                    </span>
                  </span>
                  <span className="lens-sets-showcase-product-chip-thumb">
                    <StoreImage
                      src={product.imageUrl}
                      alt=""
                      width={80}
                      height={80}
                      unoptimized
                      className="lens-sets-showcase-product-chip-image"
                    />
                  </span>
                </Link>
              ))}

              {LENS_EDITORIAL_HOTSPOTS.map((spot) => (
                <span
                  key={spot.id}
                  className="lens-sets-showcase-hotspot"
                  style={{ top: spot.top, left: spot.left }}
                  aria-hidden
                >
                  +
                </span>
              ))}
            </div>
          </div>

          <div className="lens-sets-showcase-nav">
            <button
              type="button"
              className="lens-sets-showcase-nav-btn"
              onClick={goPrev}
              aria-label="اسلاید قبلی"
            >
              <IconChevron direction="prev" />
            </button>
            <button
              type="button"
              className="lens-sets-showcase-nav-btn"
              onClick={goNext}
              aria-label="اسلاید بعدی"
            >
              <IconChevron direction="next" />
            </button>
          </div>
        </div>
      </section>

      {popupOpen
        ? createPortal(
            <LensVideoPopup
              items={items}
              activeIndex={activeIndex}
              onClose={() => setPopupOpen(false)}
              onNavigate={setActiveIndex}
            />,
            document.body,
          )
        : null}
    </>
  );
}

function IconChevron({ direction }: { direction: 'prev' | 'next' }) {
  return (
    <svg viewBox="0 0 8 14" fill="none" aria-hidden className="lens-sets-showcase-nav-icon">
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
