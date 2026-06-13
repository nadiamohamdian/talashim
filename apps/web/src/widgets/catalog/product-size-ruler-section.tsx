'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef } from 'react';
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

function getClosestSizeToCenter(
  track: HTMLDivElement,
  sizes: number[],
  itemRefs: Map<number, HTMLButtonElement>,
): number {
  const center = track.scrollLeft + track.clientWidth / 2;
  let closestSize = sizes[0] ?? 0;
  let minDistance = Number.POSITIVE_INFINITY;

  for (const size of sizes) {
    const item = itemRefs.get(size);
    if (!item) {
      continue;
    }

    const itemCenter = item.offsetLeft + item.offsetWidth / 2;
    const distance = Math.abs(itemCenter - center);
    if (distance < minDistance) {
      minDistance = distance;
      closestSize = size;
    }
  }

  return closestSize;
}

function getScrollLeftForSize(track: HTMLDivElement, item: HTMLButtonElement): number {
  return item.offsetLeft - track.clientWidth / 2 + item.offsetWidth / 2;
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
  const selectedSizeRef = useRef(selectedSize);
  const isDraggingRef = useRef(false);
  const isProgrammaticScrollRef = useRef(false);
  const suppressClickRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollRef = useRef(0);
  const snapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  selectedSizeRef.current = selectedSize;

  const snapToSize = useCallback((size: number, behavior: ScrollBehavior = 'smooth') => {
    const track = trackRef.current;
    const item = itemRefs.current.get(size);
    if (!track || !item) {
      return;
    }

    isProgrammaticScrollRef.current = true;
    track.scrollTo({ left: getScrollLeftForSize(track, item), behavior });
    window.setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, behavior === 'smooth' ? 320 : 0);
  }, []);

  const syncSelectionFromScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track || isProgrammaticScrollRef.current) {
      return;
    }

    const centeredSize = getClosestSizeToCenter(track, sizes, itemRefs.current);
    if (centeredSize !== selectedSizeRef.current) {
      onSelectSize(centeredSize);
    }
  }, [onSelectSize, sizes]);

  const scheduleSnap = useCallback(() => {
    if (snapTimerRef.current) {
      clearTimeout(snapTimerRef.current);
    }

    snapTimerRef.current = setTimeout(() => {
      const track = trackRef.current;
      if (!track || isDraggingRef.current) {
        return;
      }

      const centeredSize = getClosestSizeToCenter(track, sizes, itemRefs.current);
      onSelectSize(centeredSize);
      snapToSize(centeredSize, 'smooth');
    }, 120);
  }, [onSelectSize, sizes, snapToSize]);

  useEffect(() => {
    const track = trackRef.current;
    const item = itemRefs.current.get(selectedSize);
    if (!track || !item) {
      return;
    }

    const targetScroll = getScrollLeftForSize(track, item);
    if (Math.abs(track.scrollLeft - targetScroll) < 1) {
      return;
    }

    snapToSize(selectedSize, isDraggingRef.current ? 'auto' : 'smooth');
  }, [selectedSize, sizes, snapToSize]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) {
      return;
    }

    const onScroll = () => {
      if (isProgrammaticScrollRef.current) {
        return;
      }

      syncSelectionFromScroll();
      scheduleSnap();
    };

    track.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      track.removeEventListener('scroll', onScroll);
      if (snapTimerRef.current) {
        clearTimeout(snapTimerRef.current);
      }
    };
  }, [scheduleSnap, syncSelectionFromScroll]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!track || (event.pointerType === 'mouse' && event.button !== 0)) {
      return;
    }

    if (event.pointerType !== 'mouse') {
      return;
    }

    isDraggingRef.current = true;
    dragStartXRef.current = event.clientX;
    dragStartScrollRef.current = track.scrollLeft;
    track.setPointerCapture(event.pointerId);
    track.classList.add('is-dragging');
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!track || !isDraggingRef.current || event.pointerType !== 'mouse') {
      return;
    }

    const delta = dragStartXRef.current - event.clientX;
    track.scrollLeft = dragStartScrollRef.current + delta;
  };

  const finishDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!track || !isDraggingRef.current) {
      return;
    }

    isDraggingRef.current = false;
    track.releasePointerCapture(event.pointerId);
    track.classList.remove('is-dragging');

    const centeredSize = getClosestSizeToCenter(track, sizes, itemRefs.current);
    onSelectSize(centeredSize);
    snapToSize(centeredSize, 'smooth');

    suppressClickRef.current = true;
    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 0);
  };

  const handleItemClick = (size: number) => {
    if (suppressClickRef.current) {
      return;
    }

    onSelectSize(size);
    snapToSize(size, 'smooth');
  };

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
          <div
            ref={trackRef}
            className="product-details-ruler-track"
            role="listbox"
            aria-label={title}
            tabIndex={0}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={finishDrag}
            onPointerCancel={finishDrag}
          >
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
                role="option"
                aria-selected={selectedSize === size}
                data-size={size}
                className={
                  selectedSize === size
                    ? 'product-details-ruler-item is-active'
                    : 'product-details-ruler-item'
                }
                onClick={() => handleItemClick(size)}
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
