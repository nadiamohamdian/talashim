'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type TouchEvent,
} from 'react';
import type { ProductReviewItem } from '@/features/catalog/api/product-review-api';
import { useProductReviews } from '@/lib/api/hooks/use-product-reviews';
import {
  DEFAULT_FEATURED_REVIEW,
  type ProductReviewDemo,
} from '@/shared/config/product-detail-demo';
import { toPersianDigits } from '@/shared/lib/to-persian-digits';

function mergeProductReviews(
  seedReviews: ProductReviewDemo[],
  featuredReview: ProductReviewDemo | undefined,
  apiReviews: ProductReviewItem[],
): ProductReviewDemo[] {
  const byId = new Map<string, ProductReviewDemo>();

  for (const review of apiReviews) {
    byId.set(review.id, {
      id: review.id,
      author: review.author,
      body: review.body,
      rating: review.rating,
      date: review.date,
    });
  }

  const baseline =
    seedReviews.length > 0
      ? seedReviews
      : featuredReview
        ? [featuredReview]
        : [];

  for (const review of baseline) {
    if (!byId.has(review.id)) {
      byId.set(review.id, review);
    }
  }

  const ordered: ProductReviewDemo[] = [];
  const seen = new Set<string>();

  for (const review of apiReviews) {
    const item = byId.get(review.id);
    if (item && !seen.has(review.id)) {
      ordered.push(item);
      seen.add(review.id);
    }
  }

  for (const review of baseline) {
    if (!seen.has(review.id)) {
      const item = byId.get(review.id);
      if (item) {
        ordered.push(item);
        seen.add(review.id);
      }
    }
  }

  if (ordered.length === 0) {
    return [DEFAULT_FEATURED_REVIEW];
  }

  return ordered;
}

interface ProductReviewsShowcaseProps {
  productSlug: string;
  seedReviews?: ProductReviewDemo[];
  featuredReview?: ProductReviewDemo;
  onSubmitReview: () => void;
}

export function ProductReviewsShowcase({
  productSlug,
  seedReviews = [],
  featuredReview,
  onSubmitReview,
}: ProductReviewsShowcaseProps) {
  const { data: apiReviews = [] } = useProductReviews(productSlug);
  const [activeIndex, setActiveIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev'>('next');
  const [autoPlayPaused, setAutoPlayPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  const reviews = useMemo(
    () => mergeProductReviews(seedReviews, featuredReview, apiReviews),
    [apiReviews, featuredReview, seedReviews],
  );

  useEffect(() => {
    setActiveIndex((index) => Math.min(index, Math.max(0, reviews.length - 1)));
  }, [reviews.length]);

  const review = reviews[activeIndex] ?? DEFAULT_FEATURED_REVIEW;
  const hasMultiple = reviews.length > 1;

  const goTo = useCallback(
    (nextIndex: number) => {
      if (!hasMultiple) {
        return;
      }

      const normalized = (nextIndex + reviews.length) % reviews.length;
      if (normalized === activeIndex) {
        return;
      }

      const forwardSteps = (normalized - activeIndex + reviews.length) % reviews.length;
      setSlideDirection(forwardSteps <= reviews.length / 2 ? 'next' : 'prev');
      setAnimating(true);
      setActiveIndex(normalized);
      window.setTimeout(() => setAnimating(false), 400);
    },
    [activeIndex, hasMultiple, reviews.length],
  );

  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);
  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);

  useEffect(() => {
    if (!hasMultiple || autoPlayPaused) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setSlideDirection('next');
      setActiveIndex((index) => (index + 1) % reviews.length);
      setAnimating(true);
      window.setTimeout(() => setAnimating(false), 400);
    }, 7000);

    return () => window.clearInterval(timer);
  }, [autoPlayPaused, hasMultiple, reviews.length]);

  useEffect(() => {
    if (!hasMultiple) {
      return undefined;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (!frameRef.current?.contains(document.activeElement) && document.activeElement !== document.body) {
        return;
      }

      if (event.key === 'ArrowRight') {
        goPrev();
      }
      if (event.key === 'ArrowLeft') {
        goNext();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [goNext, goPrev, hasMultiple]);

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null;
    setAutoPlayPaused(true);
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const start = touchStartX.current;
    const end = event.changedTouches[0]?.clientX;
    touchStartX.current = null;

    if (start == null || end == null || !hasMultiple) {
      return;
    }

    const delta = end - start;
    if (Math.abs(delta) < 40) {
      return;
    }

    if (delta > 0) {
      goNext();
    } else {
      goPrev();
    }
  };

  return (
    <div
      ref={frameRef}
      role="region"
      aria-label="نظرات مشتریان"
      className={`product-details-review-frame${hasMultiple ? ' has-carousel' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={() => setAutoPlayPaused(true)}
      onMouseLeave={() => setAutoPlayPaused(false)}
      onFocus={() => setAutoPlayPaused(true)}
      onBlur={() => setAutoPlayPaused(false)}
    >
        <span className="product-details-review-line product-details-review-line-top" aria-hidden />
        <span className="product-details-review-line product-details-review-line-left" aria-hidden />
        <span className="product-details-review-line product-details-review-line-bottom" aria-hidden />
        <span className="product-details-review-line product-details-review-line-right" aria-hidden />
        <span className="product-details-quote product-details-quote-open" aria-hidden />
        <span className="product-details-quote product-details-quote-close" aria-hidden />

        <div
          key={review.id}
          className={[
            'product-details-review-content',
            animating ? 'is-animating' : '',
            animating ? `is-from-${slideDirection}` : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <p className="product-details-review-body">{review.body}</p>

          <div className="product-details-review-meta">
            <p className="product-details-review-author">{review.author}</p>
            <div
              className="product-details-review-rating"
              aria-label={`امتیاز ${review.rating.toFixed(1)}`}
            >
              <svg
                className="product-details-review-star"
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden
              >
                <path
                  d="M6 0L7.412 4.176H12L8.294 6.756L9.706 10.932L6 8.352L2.294 10.932L3.706 6.756L0 4.176H4.588L6 0Z"
                  fill="#FFB900"
                />
              </svg>
              <span className="product-details-review-score">{review.rating.toFixed(1)}</span>
            </div>
          </div>

          <button
            type="button"
            className="product-details-review-submit"
            onClick={onSubmitReview}
          >
            ثبت نظر جدید
          </button>
        </div>

        {hasMultiple ? (
          <div className="product-details-review-dots" role="tablist" aria-label="کنترل نظرات">
            {reviews.map((item, index) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                className={`product-details-review-dot${index === activeIndex ? ' is-active' : ''}`}
                onClick={() => goTo(index)}
                aria-label={`نظر ${toPersianDigits(index + 1)}`}
                aria-selected={index === activeIndex}
              />
            ))}
          </div>
        ) : null}
    </div>
  );
}
