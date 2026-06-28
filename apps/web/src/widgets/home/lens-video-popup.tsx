'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getLensProductPageHref, type LensShowcaseDemoItem } from '@/shared/config/lens-showcase-demo';
import { formatPrice } from '@/shared/lib/format-price';
import { StoreImage } from '@/shared/ui/store-image';

interface LensVideoPopupProps {
  items: LensShowcaseDemoItem[];
  activeIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function LensVideoPopup({
  items,
  activeIndex,
  onClose,
  onNavigate,
}: LensVideoPopupProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [thumbMetrics, setThumbMetrics] = useState<{
    height: number;
    top: number;
    visible: boolean;
  }>({ height: 0, top: 0, visible: false });
  const [scrollbarReady, setScrollbarReady] = useState(false);
  const item = items[activeIndex] ?? items[0];
  const hasPrev = activeIndex > 0;
  const hasNext = activeIndex < items.length - 1;

  const handlePrev = useCallback(() => {
    if (hasPrev) onNavigate(activeIndex - 1);
  }, [activeIndex, hasPrev, onNavigate]);

  const handleNext = useCallback(() => {
    if (hasNext) onNavigate(activeIndex + 1);
  }, [activeIndex, hasNext, onNavigate]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft') handleNext();
      if (event.key === 'ArrowRight') handlePrev();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleNext, handlePrev, onClose]);

  const updateScrollbar = useCallback(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollEl;
    const isScrollable = scrollHeight > clientHeight + 1;

    if (!isScrollable) {
      setThumbMetrics({ height: clientHeight * 0.45, top: 0, visible: true });
      return;
    }

    const thumbHeight = Math.max((clientHeight / scrollHeight) * clientHeight, 36);
    const maxTop = clientHeight - thumbHeight;
    const top = maxTop <= 0 ? 0 : (scrollTop / (scrollHeight - clientHeight)) * maxTop;

    setThumbMetrics({ height: thumbHeight, top, visible: true });
  }, []);

  useEffect(() => {
    setScrollbarReady(false);
    const frame = window.requestAnimationFrame(() => {
      updateScrollbar();
      setScrollbarReady(true);
    });

    const scrollEl = scrollRef.current;
    if (!scrollEl) {
      return () => window.cancelAnimationFrame(frame);
    }

    scrollEl.addEventListener('scroll', updateScrollbar, { passive: true });
    const resizeObserver = new ResizeObserver(updateScrollbar);
    resizeObserver.observe(scrollEl);

    return () => {
      window.cancelAnimationFrame(frame);
      scrollEl.removeEventListener('scroll', updateScrollbar);
      resizeObserver.disconnect();
    };
  }, [activeIndex, item?.products, updateScrollbar]);

  const openProduct = useCallback(
    (slug: string) => {
      void router.push(getLensProductPageHref(slug));
    },
    [router],
  );

  if (!item) return null;

  const popupImage =
    item.heroImageUrl?.trim() || item.thumbnailUrl?.trim() || '/images/home/lens-demo-poster.png';

  const visibleProducts = item.products.filter((product) => Boolean(product.slug?.trim()));

  return (
    <div className="lens-video-popup" role="dialog" aria-modal="true" aria-label="لنز طلاشیم">
      <button
        type="button"
        className="lens-video-popup-backdrop"
        onClick={onClose}
        aria-label="بستن"
      />

      <div className="lens-video-popup-stage">
        <button
          type="button"
          className="lens-video-popup-close"
          onClick={onClose}
          aria-label="بستن"
        >
          <span aria-hidden>×</span>
        </button>

        <button
          type="button"
          className="lens-video-popup-nav lens-video-popup-nav-prev"
          onClick={handlePrev}
          disabled={!hasPrev}
          aria-label="اسلاید قبلی"
        >
          <span aria-hidden>‹</span>
        </button>

        <button
          type="button"
          className="lens-video-popup-nav lens-video-popup-nav-next"
          onClick={handleNext}
          disabled={!hasNext}
          aria-label="اسلاید بعدی"
        >
          <span aria-hidden>›</span>
        </button>

        <div className="lens-video-popup-media">
          <StoreImage
            src={popupImage}
            alt={item.title ?? 'لنز طلاشیم'}
            fill
            unoptimized
            className="lens-video-popup-poster"
            sizes="100vw"
            priority
          />
        </div>

        <div className="lens-video-popup-products">
          <div className="lens-video-popup-products-layout">
            <div className="lens-video-popup-scrollbar" aria-hidden>
              <div className="lens-video-popup-scrollbar-track">
                {scrollbarReady && thumbMetrics.visible ? (
                  <div
                    className="lens-video-popup-scrollbar-thumb"
                    style={{
                      height: `${thumbMetrics.height}px`,
                      transform: `translateY(${thumbMetrics.top}px)`,
                    }}
                  />
                ) : null}
              </div>
            </div>

            <div
              ref={scrollRef}
              className="lens-video-popup-products-scroll"
            >
            {visibleProducts.map((product) => (
              <button
                key={product.id}
                type="button"
                className="lens-video-popup-product"
                onClick={() => openProduct(product.slug)}
              >
                <div className="lens-video-popup-product-copy">
                  <p className="lens-video-popup-product-title">{product.title}</p>
                  <p className="lens-video-popup-product-price">
                    {formatPrice(product.priceToman)} تومان
                  </p>
                  <p className="lens-video-popup-product-weight">
                    {product.weightGram.toLocaleString('fa-IR', {
                      maximumFractionDigits: 1,
                    })}{' '}
                    گرم
                  </p>
                </div>

                <div className="lens-video-popup-product-thumb">
                  <StoreImage
                    src={product.imageUrl}
                    alt=""
                    fill
                    className="lens-video-popup-product-image"
                    sizes="64px"
                  />
                </div>

                <span className="lens-video-popup-product-arrow" aria-hidden>
                  ←
                </span>
              </button>
            ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
