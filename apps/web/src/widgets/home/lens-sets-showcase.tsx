'use client';

import { useEffect, useState, type CSSProperties, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import type { CmsLensSetsShowcaseConfig } from '@sadafgold/types';
import {
  LENS_EDITORIAL_HERO,
  LENS_EDITORIAL_HOTSPOTS,
  LENS_EDITORIAL_META,
  getLensProductPageHref,
  resolveLensChipPosition,
  type LensHotspot,
  type LensShowcaseDemoItem,
} from '@/shared/config/lens-showcase-demo';
import { formatPrice } from '@/shared/lib/format-price';
import { StoreImage } from '@/shared/ui/store-image';
import { LensVideoPopup } from '@/widgets/home/lens-video-popup';

interface LensSetsShowcaseProps {
  items: LensShowcaseDemoItem[];
  section?: CmsLensSetsShowcaseConfig;
}

function resolveHotspots(item: LensShowcaseDemoItem | undefined): readonly LensHotspot[] {
  if (item?.hotspots?.length) {
    return item.hotspots.map((spot, index) => {
      const fallback = LENS_EDITORIAL_HOTSPOTS[index];
      if (!fallback) {
        return spot;
      }

      return {
        ...spot,
        chipTopMobile: spot.chipTopMobile ?? fallback.chipTopMobile,
        chipLeftMobile: spot.chipLeftMobile ?? fallback.chipLeftMobile,
      };
    });
  }
  return LENS_EDITORIAL_HOTSPOTS;
}

function createDefaultOpenChips(count: number): Set<number> {
  const isMobile = window.matchMedia('(max-width: 1023.98px)').matches;
  return isMobile ? new Set([0]) : new Set(Array.from({ length: count }, (_, index) => index));
}

export function LensSetsShowcase({ items, section }: LensSetsShowcaseProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [popupOpen, setPopupOpen] = useState(false);
  const [openChips, setOpenChips] = useState<Set<number>>(() => new Set([0]));
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  const slideCount = items.length;
  const activeItem = items[activeIndex] ?? items[0];
  const activeHotspots = resolveHotspots(activeItem);
  const spotlightProducts = activeItem?.products.slice(0, activeHotspots.length) ?? [];
  const sectionCopy = {
    eyebrow: section?.eyebrow?.trim() || LENS_EDITORIAL_META.eyebrow || 'Talashim Lens',
    title: section?.title?.trim() || LENS_EDITORIAL_META.title,
    description: section?.description?.trim() || LENS_EDITORIAL_META.description,
  };

  const goPrev = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setActiveIndex((index) => (index - 1 + slideCount) % slideCount);
  };

  const goNext = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setActiveIndex((index) => (index + 1) % slideCount);
  };

  useEffect(() => {
    setOpenChips(createDefaultOpenChips(activeHotspots.length));
  }, [activeIndex, activeHotspots.length]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 1023.98px)');
    const syncViewport = () => setIsMobileViewport(mediaQuery.matches);

    syncViewport();
    mediaQuery.addEventListener('change', syncViewport);
    return () => mediaQuery.removeEventListener('change', syncViewport);
  }, []);

  const toggleChip = (index: number, event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setOpenChips((previous) => {
      const isOpen = previous.has(index);
      const isMobile = window.matchMedia('(max-width: 1023.98px)').matches;

      if (isMobile) {
        return isOpen ? new Set<number>() : new Set([index]);
      }

      const next = new Set(previous);
      if (isOpen) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const openPopup = () => {
    setPopupOpen(true);
  };

  if (!activeItem) {
    return null;
  }

  const heroImage =
    activeItem.heroImageUrl?.trim() ||
    activeItem.thumbnailUrl ||
    LENS_EDITORIAL_HERO;

  return (
    <>
      <section className="lens-sets-showcase" aria-labelledby="lens-sets-title">
        <div className="lens-sets-showcase-inner">
          <header className="lens-sets-showcase-intro">
            <span className="lens-sets-showcase-eyebrow">{sectionCopy.eyebrow}</span>
            <h2 id="lens-sets-title" className="lens-sets-showcase-title">
              {sectionCopy.title}
            </h2>
            <p className="lens-sets-showcase-description">{sectionCopy.description}</p>
          </header>

          <div className="lens-sets-showcase-stage">
            <div
              className="lens-sets-showcase-hero"
              role="button"
              tabIndex={-1}
              onClick={openPopup}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  openPopup();
                }
              }}
              aria-label="مشاهده لنز طلاشیم"
            >
              <div className="lens-sets-showcase-hero-media" aria-hidden>
                <StoreImage
                  src={heroImage}
                  alt=""
                  fill
                  unoptimized
                  className="lens-sets-showcase-hero-image"
                  sizes="(min-width: 1024px) min(691px, 50vw), 350px"
                />
                <span className="lens-sets-showcase-hero-overlay" />
              </div>

              {spotlightProducts.map((product, index) => {
                const isOpen = openChips.has(index);
                const spot = activeHotspots[index];
                const chipPosition = spot ? resolveLensChipPosition(spot, isMobileViewport) : null;

                return (
                  <Link
                    key={product.id}
                    id={`lens-sets-chip-${index}`}
                    href={getLensProductPageHref(product.slug)}
                    className={`lens-sets-showcase-product-chip lens-sets-showcase-product-chip--${index}${
                      isOpen ? ' lens-sets-showcase-product-chip--open' : ''
                    }`}
                    style={
                      chipPosition
                        ? ({
                            '--lens-chip-top': chipPosition.top,
                            '--lens-chip-left': chipPosition.left,
                            '--lens-chip-tx': spot?.chipTranslateX ?? '-50%',
                            '--lens-chip-ty': spot?.chipTranslateY ?? 'calc(-100% - 8px)',
                          } as CSSProperties)
                        : undefined
                    }
                    onClick={(event) => event.stopPropagation()}
                    aria-hidden={!isOpen}
                    tabIndex={isOpen ? 0 : -1}
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
                );
              })}

              {activeHotspots.map((spot, index) => {
                const product = spotlightProducts[index];
                const isOpen = openChips.has(index);

                return (
                  <button
                    key={spot.id ?? `lens-hotspot-${index}`}
                    type="button"
                    className={`lens-sets-showcase-hotspot lens-sets-showcase-hotspot--${index}${
                      isOpen ? ' lens-sets-showcase-hotspot--active' : ''
                    }`}
                    style={{ top: spot.top, left: spot.left }}
                    onClick={(event) => toggleChip(index, event)}
                    aria-expanded={isOpen}
                    aria-controls={`lens-sets-chip-${index}`}
                    aria-label={
                      product
                        ? `${isOpen ? 'بستن' : 'نمایش'} ${product.title}`
                        : `نمایش محصول ${index + 1}`
                    }
                  >
                    +
                  </button>
                );
              })}
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
