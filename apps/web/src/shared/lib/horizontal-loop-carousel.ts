'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';

export const HORIZONTAL_LOOP_COPY_COUNT = 3;

export interface LoopedCarouselEntry<T> {
  item: T;
  loopKey: string;
}

export function buildLoopedCarouselItems<T extends { id: string }>(
  items: readonly T[],
  copyCount = HORIZONTAL_LOOP_COPY_COUNT,
): LoopedCarouselEntry<T>[] {
  if (items.length === 0) {
    return [];
  }

  return Array.from({ length: copyCount }, (_, copyIndex) =>
    items.map((item, itemIndex) => ({
      item,
      loopKey: `${item.id}-loop-${copyIndex}-${itemIndex}`,
    })),
  ).flat();
}

export function isRtlScrollElement(element: HTMLElement): boolean {
  return getComputedStyle(element).direction === 'rtl';
}

export function getNormalizedScrollLeft(track: HTMLDivElement): number {
  if (!isRtlScrollElement(track)) {
    return track.scrollLeft;
  }

  if (track.scrollLeft <= 0) {
    return Math.abs(track.scrollLeft);
  }

  return track.scrollWidth - track.clientWidth - track.scrollLeft;
}

export function setNormalizedScrollLeft(
  track: HTMLDivElement,
  position: number,
  behavior: ScrollBehavior = 'auto',
): void {
  if (behavior === 'auto') {
    applyNormalizedScrollLeft(track, position);
    return;
  }

  if (!isRtlScrollElement(track)) {
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

function applyNormalizedScrollLeft(track: HTMLDivElement, position: number): void {
  if (!isRtlScrollElement(track)) {
    track.scrollLeft = position;
    return;
  }

  if (track.scrollLeft <= 0) {
    track.scrollLeft = -position;
    return;
  }

  const maxScroll = track.scrollWidth - track.clientWidth;
  track.scrollLeft = maxScroll - position;
}

function isInteractiveDragTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) {
    return false;
  }

  return Boolean(target.closest('button, a, input, textarea, select, [role="button"]'));
}

export function jumpNormalizedScrollLeft(track: HTMLDivElement, position: number): void {
  const previousSnap = track.style.scrollSnapType;
  track.style.scrollSnapType = 'none';
  setNormalizedScrollLeft(track, position, 'auto');
  requestAnimationFrame(() => {
    track.style.scrollSnapType = previousSnap;
  });
}

export function getLoopTrackMetrics(
  track: HTMLDivElement,
  itemCount: number,
  cardSelector: string,
): { step: number; segmentWidth: number } | null {
  const firstCard = track.querySelector<HTMLElement>(cardSelector);
  if (!firstCard || itemCount === 0) {
    return null;
  }

  const trackStyles = getComputedStyle(track);
  const gap = Number.parseFloat(trackStyles.columnGap || trackStyles.gap || '0') || 0;
  const step = firstCard.offsetWidth + gap;
  const segmentWidth = step * itemCount;

  return { step, segmentWidth };
}

interface UseHorizontalLoopCarouselOptions<T extends { id: string }> {
  items: readonly T[];
  cardSelector: string;
}

export function useHorizontalLoopCarousel<T extends { id: string }>({
  items,
  cardSelector,
}: UseHorizontalLoopCarouselOptions<T>) {
  const trackRef = useRef<HTMLDivElement>(null);
  const isJumpingRef = useRef(false);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartNormalizedRef = useRef(0);
  const canLoop = items.length > 1;

  const trackItems = useMemo(() => {
    if (!canLoop) {
      return items.map((item) => ({ item, loopKey: item.id }));
    }

    return buildLoopedCarouselItems(items);
  }, [canLoop, items]);

  const normalizeLoopPosition = useCallback(() => {
    const track = trackRef.current;
    if (!track || !canLoop || isJumpingRef.current || isDraggingRef.current) {
      return;
    }

    const metrics = getLoopTrackMetrics(track, items.length, cardSelector);
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
  }, [canLoop, cardSelector, items.length]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || items.length === 0 || !canLoop) {
      return;
    }

    const metrics = getLoopTrackMetrics(track, items.length, cardSelector);
    if (!metrics) {
      return;
    }

    jumpNormalizedScrollLeft(track, metrics.segmentWidth);
  }, [canLoop, cardSelector, items]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || !canLoop) {
      return;
    }

    const onScroll = () => {
      if (!isJumpingRef.current && !isDraggingRef.current) {
        requestAnimationFrame(normalizeLoopPosition);
      }
    };

    track.addEventListener('scroll', onScroll, { passive: true });
    return () => track.removeEventListener('scroll', onScroll);
  }, [canLoop, normalizeLoopPosition]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) {
      return;
    }

    const finishDrag = (event: PointerEvent) => {
      if (!isDraggingRef.current) {
        return;
      }

      isDraggingRef.current = false;
      if (track.hasPointerCapture(event.pointerId)) {
        track.releasePointerCapture(event.pointerId);
      }
      track.classList.remove('is-dragging');
      track.style.scrollSnapType = '';
      requestAnimationFrame(normalizeLoopPosition);
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' && event.button !== 0) {
        return;
      }

      if (isInteractiveDragTarget(event.target)) {
        return;
      }

      isDraggingRef.current = true;
      dragStartXRef.current = event.clientX;
      dragStartNormalizedRef.current = getNormalizedScrollLeft(track);
      track.setPointerCapture(event.pointerId);
      track.classList.add('is-dragging');
      track.style.scrollSnapType = 'none';
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!isDraggingRef.current) {
        return;
      }

      event.preventDefault();
      const delta = event.clientX - dragStartXRef.current;
      applyNormalizedScrollLeft(track, dragStartNormalizedRef.current + delta);
    };

    const onPointerUp = (event: PointerEvent) => {
      finishDrag(event);
    };

    const onPointerCancel = (event: PointerEvent) => {
      finishDrag(event);
    };

    track.addEventListener('pointerdown', onPointerDown);
    track.addEventListener('pointermove', onPointerMove);
    track.addEventListener('pointerup', onPointerUp);
    track.addEventListener('pointercancel', onPointerCancel);

    return () => {
      track.removeEventListener('pointerdown', onPointerDown);
      track.removeEventListener('pointermove', onPointerMove);
      track.removeEventListener('pointerup', onPointerUp);
      track.removeEventListener('pointercancel', onPointerCancel);
    };
  }, [normalizeLoopPosition]);

  const scrollTrack = useCallback(
    (direction: 'prev' | 'next') => {
      const track = trackRef.current;
      if (!track) {
        return;
      }

      const metrics = getLoopTrackMetrics(track, items.length, cardSelector);
      if (!metrics) {
        return;
      }

      const { step } = metrics;
      const delta = direction === 'next' ? step : -step;
      const isRtl = isRtlScrollElement(track);

      track.scrollBy({
        left: isRtl ? -delta : delta,
        behavior: 'smooth',
      });

      window.setTimeout(() => {
        normalizeLoopPosition();
      }, 360);
    },
    [cardSelector, items.length, normalizeLoopPosition],
  );

  return {
    trackRef,
    trackItems,
    canLoop,
    scrollTrack,
  };
}
