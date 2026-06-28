'use client';

import { useEffect, useRef, type RefObject } from 'react';
import { getNormalizedScrollLeft } from '@/shared/lib/horizontal-loop-carousel';

export const CAROUSEL_DRAG_CLICK_THRESHOLD_PX = 8;

export function isCarouselControlTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) {
    return false;
  }

  return Boolean(
    target.closest('a, button, input, textarea, select, label, [data-carousel-control]'),
  );
}

function isRtlScrollElement(element: HTMLElement): boolean {
  return getComputedStyle(element).direction === 'rtl';
}

export function applyNormalizedScrollLeft(element: HTMLElement, position: number): void {
  if (!(element instanceof HTMLDivElement)) {
    element.scrollLeft = position;
    return;
  }

  if (!isRtlScrollElement(element)) {
    element.scrollLeft = position;
    return;
  }

  if (element.scrollLeft <= 0) {
    element.scrollLeft = -position;
    return;
  }

  const maxScroll = element.scrollWidth - element.clientWidth;
  element.scrollLeft = maxScroll - position;
}

export interface UseHorizontalScrollDragOptions {
  enabled?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export function useHorizontalScrollDrag(
  containerRef: RefObject<HTMLElement | null>,
  options: UseHorizontalScrollDragOptions = {},
): void {
  const { enabled = true, onDragStart, onDragEnd } = options;
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollRef = useRef(0);
  const suppressClickRef = useRef(false);
  const onDragStartRef = useRef(onDragStart);
  const onDragEndRef = useRef(onDragEnd);

  onDragStartRef.current = onDragStart;
  onDragEndRef.current = onDragEnd;

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled) {
      return;
    }

    const finishDrag = (event: PointerEvent) => {
      if (!isDraggingRef.current) {
        return;
      }

      isDraggingRef.current = false;
      if (container.hasPointerCapture(event.pointerId)) {
        container.releasePointerCapture(event.pointerId);
      }
      container.classList.remove('is-dragging');
      container.style.scrollSnapType = '';
      onDragEndRef.current?.();

      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' && event.button !== 0) {
        return;
      }

      if (isCarouselControlTarget(event.target)) {
        return;
      }

      isDraggingRef.current = true;
      suppressClickRef.current = false;
      dragStartXRef.current = event.clientX;
      dragStartScrollRef.current = getNormalizedScrollLeft(container as HTMLDivElement);
      container.setPointerCapture(event.pointerId);
      container.classList.add('is-dragging');
      container.style.scrollSnapType = 'none';
      onDragStartRef.current?.();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!isDraggingRef.current) {
        return;
      }

      const delta = event.clientX - dragStartXRef.current;
      if (Math.abs(delta) > CAROUSEL_DRAG_CLICK_THRESHOLD_PX) {
        suppressClickRef.current = true;
      }

      event.preventDefault();
      applyNormalizedScrollLeft(container, dragStartScrollRef.current - delta);
    };

    const onClickCapture = (event: MouseEvent) => {
      if (!suppressClickRef.current) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
    };

    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerup', finishDrag);
    container.addEventListener('pointercancel', finishDrag);
    container.addEventListener('click', onClickCapture, true);

    return () => {
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerup', finishDrag);
      container.removeEventListener('pointercancel', finishDrag);
      container.removeEventListener('click', onClickCapture, true);
    };
  }, [containerRef, enabled]);
}

export interface UseCarouselPointerSwipeOptions {
  enabled?: boolean;
  onSwipeNext: () => void;
  onSwipePrev: () => void;
}

export function useCarouselPointerSwipe(
  containerRef: RefObject<HTMLElement | null>,
  options: UseCarouselPointerSwipeOptions,
): void {
  const { enabled = true, onSwipeNext, onSwipePrev } = options;
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const suppressClickRef = useRef(false);
  const onSwipeNextRef = useRef(onSwipeNext);
  const onSwipePrevRef = useRef(onSwipePrev);

  onSwipeNextRef.current = onSwipeNext;
  onSwipePrevRef.current = onSwipePrev;

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled) {
      return;
    }

    const finishDrag = (event: PointerEvent) => {
      if (!isDraggingRef.current) {
        return;
      }

      const delta = event.clientX - dragStartXRef.current;
      isDraggingRef.current = false;

      if (container.hasPointerCapture(event.pointerId)) {
        container.releasePointerCapture(event.pointerId);
      }
      container.classList.remove('is-dragging');

      if (Math.abs(delta) >= CAROUSEL_DRAG_CLICK_THRESHOLD_PX) {
        suppressClickRef.current = true;
        if (delta < 0) {
          onSwipeNextRef.current();
        } else {
          onSwipePrevRef.current();
        }
      }

      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' && event.button !== 0) {
        return;
      }

      if (isCarouselControlTarget(event.target)) {
        return;
      }

      isDraggingRef.current = true;
      suppressClickRef.current = false;
      dragStartXRef.current = event.clientX;
      container.setPointerCapture(event.pointerId);
      container.classList.add('is-dragging');
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!isDraggingRef.current) {
        return;
      }

      if (Math.abs(event.clientX - dragStartXRef.current) > CAROUSEL_DRAG_CLICK_THRESHOLD_PX) {
        event.preventDefault();
      }
    };

    const onClickCapture = (event: MouseEvent) => {
      if (!suppressClickRef.current) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
    };

    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerup', finishDrag);
    container.addEventListener('pointercancel', finishDrag);
    container.addEventListener('click', onClickCapture, true);

    return () => {
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerup', finishDrag);
      container.removeEventListener('pointercancel', finishDrag);
      container.removeEventListener('click', onClickCapture, true);
    };
  }, [containerRef, enabled]);
}
