'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { HomeMagazineArticleItem } from '@/shared/config/home-magazine-demo';
import {
  getNormalizedScrollLeft,
  setNormalizedScrollLeft,
} from '@/shared/lib/horizontal-loop-carousel';
import { useHorizontalScrollDrag } from '@/shared/lib/horizontal-scroll-drag';
import { HomeMagazineArticleCard } from '@/widgets/home/home-magazine-article-card';

interface HomeMagazineCarouselProps {
  items: HomeMagazineArticleItem[];
}

function MagazineCarouselArrow({ flipped = false }: { flipped?: boolean }) {
  return (
    <svg
      width="28"
      height="21"
      viewBox="0 0 28 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={flipped ? 'home-magazine-showcase-nav-icon is-flipped' : 'home-magazine-showcase-nav-icon'}
    >
      <path
        d="M26.75 10.25H22.6875M10.5 19.75L0.75 10.25L10.5 0.75M0.75 10.25H17.8125"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HomeMagazineCarousel({ items }: HomeMagazineCarouselProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useHorizontalScrollDrag(frameRef);

  const updateScrollState = useCallback(() => {
    const frame = frameRef.current;
    if (!frame) {
      return;
    }

    const maxScroll = Math.max(0, frame.scrollWidth - frame.clientWidth);
    const position = getNormalizedScrollLeft(frame);
    const tolerance = 2;

    setCanScrollPrev(position > tolerance);
    setCanScrollNext(position < maxScroll - tolerance);
  }, []);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) {
      return;
    }

    const syncScrollState = () => {
      window.requestAnimationFrame(updateScrollState);
    };

    syncScrollState();

    const onScroll = () => updateScrollState();
    frame.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', syncScrollState);

    const resizeObserver = new ResizeObserver(syncScrollState);
    resizeObserver.observe(frame);
    const track = frame.querySelector('.home-magazine-showcase-track');
    if (track instanceof HTMLElement) {
      resizeObserver.observe(track);
    }

    return () => {
      frame.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', syncScrollState);
      resizeObserver.disconnect();
    };
  }, [items.length, updateScrollState]);

  const scrollByStep = useCallback(
    (direction: 'prev' | 'next') => {
      const frame = frameRef.current;
      if (!frame) {
        return;
      }

      const card = frame.querySelector<HTMLElement>('.home-magazine-article-card');
      const track = frame.querySelector<HTMLElement>('.home-magazine-showcase-track');
      if (!card || !track) {
        return;
      }

      const trackStyles = getComputedStyle(track);
      const gap = Number.parseFloat(trackStyles.columnGap || trackStyles.gap || '0') || 0;
      const step = card.offsetWidth + gap;
      const position = getNormalizedScrollLeft(frame);
      const maxScroll = Math.max(0, frame.scrollWidth - frame.clientWidth);
      const nextPosition =
        direction === 'next'
          ? Math.min(position + step, maxScroll)
          : Math.max(position - step, 0);

      setNormalizedScrollLeft(frame, nextPosition, 'smooth');
    },
    [],
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <>
      <div className="home-magazine-showcase-header">
        <div className="home-magazine-showcase-nav" aria-label="پیمایش مجله">
          <button
            type="button"
            className="home-magazine-showcase-nav-btn"
            onClick={() => scrollByStep('next')}
            aria-label="مطالب بعدی"
            disabled={!canScrollNext}
            data-carousel-control
          >
            <MagazineCarouselArrow flipped />
          </button>
          <button
            type="button"
            className="home-magazine-showcase-nav-btn"
            onClick={() => scrollByStep('prev')}
            aria-label="مطالب قبلی"
            disabled={!canScrollPrev}
            data-carousel-control
          >
            <MagazineCarouselArrow flipped />
          </button>
        </div>

        <div className="home-magazine-showcase-heading">
          <h2 id="home-magazine-title" className="home-magazine-showcase-title">
            مجله طلاشیم
          </h2>
        </div>
      </div>

      <div ref={frameRef} className="home-magazine-showcase-frame store-carousel-scroll">
        <div className="home-magazine-showcase-track" role="list">
          {items.map((item) => (
            <HomeMagazineArticleCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </>
  );
}
