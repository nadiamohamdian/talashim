'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import type { HomeProductCarouselItem } from '@/shared/config/storefront-ia';
import { useHorizontalScrollDrag } from '@/shared/lib/horizontal-scroll-drag';
import { HomeProductCarouselCard } from '@/widgets/home/home-product-carousel-card';

export interface HomeProductCarouselProps {
  id: string;
  title: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  items: readonly HomeProductCarouselItem[];
  className?: string;
}

const LOOP_COPY_COUNT = 3;
const DESKTOP_CAROUSEL_LOOP_QUERY = '(min-width: 1024px)';

function subscribeDesktopCarouselLoop(onStoreChange: () => void): () => void {
  const mq = window.matchMedia(DESKTOP_CAROUSEL_LOOP_QUERY);
  mq.addEventListener('change', onStoreChange);
  return () => mq.removeEventListener('change', onStoreChange);
}

function getDesktopCarouselLoopSnapshot(): boolean {
  return window.matchMedia(DESKTOP_CAROUSEL_LOOP_QUERY).matches;
}

function getDesktopCarouselLoopServerSnapshot(): boolean {
  return false;
}

function useDesktopCarouselLoop(): boolean {
  return useSyncExternalStore(
    subscribeDesktopCarouselLoop,
    getDesktopCarouselLoopSnapshot,
    getDesktopCarouselLoopServerSnapshot,
  );
}

interface LoopedCarouselItem {
  item: HomeProductCarouselItem;
  loopKey: string;
}

function buildLoopedItems(items: readonly HomeProductCarouselItem[]): LoopedCarouselItem[] {
  if (items.length === 0) {
    return [];
  }

  return Array.from({ length: LOOP_COPY_COUNT }, (_, copyIndex) =>
    items.map((item, itemIndex) => ({
      item,
      loopKey: `${item.id}-loop-${copyIndex}-${itemIndex}`,
    })),
  ).flat();
}

function isRtlElement(element: HTMLElement): boolean {
  return getComputedStyle(element).direction === 'rtl';
}

function getNormalizedScrollLeft(track: HTMLDivElement): number {
  if (!isRtlElement(track)) {
    return track.scrollLeft;
  }

  if (track.scrollLeft <= 0) {
    return Math.abs(track.scrollLeft);
  }

  return track.scrollWidth - track.clientWidth - track.scrollLeft;
}

function setNormalizedScrollLeft(
  track: HTMLDivElement,
  position: number,
  behavior: ScrollBehavior = 'auto',
): void {
  if (!isRtlElement(track)) {
    track.scrollTo({ left: position, behavior });
    return;
  }

  if (track.scrollLeft <= 0) {
    track.scrollTo({ left: -position, behavior });
    return;
  }

  const maxScroll = track.scrollWidth - track.clientWidth;
  track.scrollTo({ left: maxScroll - position, behavior });
}

function jumpNormalizedScrollLeft(track: HTMLDivElement, position: number): void {
  const previousSnap = track.style.scrollSnapType;
  track.style.scrollSnapType = 'none';
  setNormalizedScrollLeft(track, position, 'auto');
  requestAnimationFrame(() => {
    track.style.scrollSnapType = previousSnap;
  });
}

function getTrackMetrics(track: HTMLDivElement, itemCount: number) {
  const firstCard = track.querySelector<HTMLElement>('.home-product-carousel-card');
  if (!firstCard || itemCount === 0) {
    return null;
  }

  const trackStyles = getComputedStyle(track);
  const gap = Number.parseFloat(trackStyles.columnGap || trackStyles.gap || '0') || 0;
  const step = firstCard.offsetWidth + gap;
  const segmentWidth = step * itemCount;

  return { step, segmentWidth };
}

export function HomeProductCarousel({
  id,
  title,
  viewAllHref = '/products',
  viewAllLabel = 'نمایش همه',
  items,
  className,
}: HomeProductCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const isJumpingRef = useRef(false);
  const loopEnabled = useDesktopCarouselLoop();
  const trackItems = useMemo(() => {
    if (loopEnabled) {
      return buildLoopedItems(items);
    }

    return items.map((item) => ({
      item,
      loopKey: item.id,
    }));
  }, [items, loopEnabled]);
  const canLoop = loopEnabled && items.length > 1;

  const normalizeLoopPosition = useCallback(() => {
    const track = trackRef.current;
    if (!track || !canLoop || isJumpingRef.current) {
      return;
    }

    const metrics = getTrackMetrics(track, items.length);
    if (!metrics) {
      return;
    }

    const { segmentWidth } = metrics;
    const position = getNormalizedScrollLeft(track);
    const lowerBound = segmentWidth * 0.5;
    const upperBound = segmentWidth * 2.5;

    if (position < lowerBound) {
      isJumpingRef.current = true;
      jumpNormalizedScrollLeft(track, position + segmentWidth);
      isJumpingRef.current = false;
      return;
    }

    if (position > upperBound) {
      isJumpingRef.current = true;
      jumpNormalizedScrollLeft(track, position - segmentWidth);
      isJumpingRef.current = false;
    }
  }, [canLoop, items.length]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || items.length === 0 || !loopEnabled) {
      return;
    }

    const metrics = getTrackMetrics(track, items.length);
    if (!metrics) {
      return;
    }

    jumpNormalizedScrollLeft(track, metrics.segmentWidth);
  }, [items, loopEnabled]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || !canLoop) {
      return;
    }

    const onScroll = () => {
      if (!isJumpingRef.current) {
        requestAnimationFrame(normalizeLoopPosition);
      }
    };

    track.addEventListener('scroll', onScroll, { passive: true });
    return () => track.removeEventListener('scroll', onScroll);
  }, [canLoop, normalizeLoopPosition]);

  const scrollTrack = useCallback(
    (direction: 'prev' | 'next') => {
      const track = trackRef.current;
      if (!track) {
        return;
      }

      const metrics = getTrackMetrics(track, items.length);
      if (!metrics) {
        return;
      }

      const { step } = metrics;
      const delta = direction === 'next' ? step : -step;
      const isRtl = isRtlElement(track);

      track.scrollBy({
        left: isRtl ? -delta : delta,
        behavior: 'smooth',
      });

      window.setTimeout(() => {
        normalizeLoopPosition();
      }, 360);
    },
    [items.length, normalizeLoopPosition],
  );

  useHorizontalScrollDrag(trackRef, {
    onDragEnd: () => {
      normalizeLoopPosition();
    },
  });

  if (items.length === 0) {
    return null;
  }

  return (
    <section
      className={className ? `home-product-carousel ${className}` : 'home-product-carousel'}
      aria-labelledby={id}
    >
      <div className="home-product-carousel-inner">
        <div className="home-product-carousel-header">
          <div className="home-product-carousel-heading">
            <h2 id={id} className="home-product-carousel-title">
              {title}
            </h2>
          </div>

          <div className="home-product-carousel-actions">
            <div className="home-product-carousel-nav" aria-label="پیمایش محصولات">
              <button
                type="button"
                className="home-product-carousel-nav-btn home-product-carousel-nav-btn--prev"
                onClick={() => scrollTrack('prev')}
                aria-label="محصولات قبلی"
                disabled={!canLoop}
                data-carousel-control
              >
                <IconCarouselArrow direction="prev" />
              </button>
              <button
                type="button"
                className="home-product-carousel-nav-btn home-product-carousel-nav-btn--next"
                onClick={() => scrollTrack('next')}
                aria-label="محصولات بعدی"
                disabled={!canLoop}
                data-carousel-control
              >
                <IconCarouselArrow direction="next" />
              </button>
            </div>

            <Link href={viewAllHref} className="home-product-carousel-view-all">
              {viewAllLabel}
            </Link>
          </div>
        </div>

        <div
          ref={trackRef}
          className="home-product-carousel-track store-carousel-scroll"
          role="list"
        >
          {trackItems.map(({ item, loopKey }) => (
            <article key={loopKey} className="store-product-card home-product-carousel-card" role="listitem">
              {item.href ? (
                <Link href={item.href} className="home-product-carousel-card-link" draggable={false}>
                  <HomeProductCarouselCard item={item} />
                </Link>
              ) : (
                <div className="home-product-carousel-card-link">
                  <HomeProductCarouselCard item={item} />
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function IconCarouselArrow({ direction }: { direction: 'prev' | 'next' }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/images/home/carousel-nav-arrow.png"
      alt=""
      aria-hidden
      className={`home-product-carousel-nav-icon home-product-carousel-nav-icon--${direction}`}
      decoding="async"
      draggable={false}
    />
  );
}
