'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type TouchEvent,
} from 'react';
import {
  BLOG_POST_DEMO_REVIEWS,
  BLOG_POST_FEATURED_REVIEW,
} from '@/shared/config/blog-post-page';
import type { ProductReviewDemo } from '@/shared/config/product-detail-demo';
import { useBlogPostReviews } from '@/lib/api/hooks/use-blog-reviews';
import { toPersianDigits } from '@/shared/lib/to-persian-digits';
import { BlogPostCarouselArrow } from '@/widgets/blog/blog-post-carousel-arrow';
import { ProductReviewWizard } from '@/features/catalog/components/product-review-wizard';

interface BlogPostReviewCardProps {
  review: ProductReviewDemo;
  contentClassName?: string;
  onSubmitClick: () => void;
}

function BlogPostReviewCard({ review, contentClassName = '', onSubmitClick }: BlogPostReviewCardProps) {
  return (
    <article className="blog-post-review-frame">
      <span className="blog-post-review-line blog-post-review-line-top" aria-hidden />
      <span className="blog-post-review-line blog-post-review-line-left" aria-hidden />
      <span className="blog-post-review-line blog-post-review-line-bottom" aria-hidden />
      <span className="blog-post-review-line blog-post-review-line-right" aria-hidden />
      <span className="blog-post-review-quote blog-post-review-quote-open" aria-hidden />
      <span className="blog-post-review-quote blog-post-review-quote-close" aria-hidden />

      <div className={['blog-post-review-content', contentClassName].filter(Boolean).join(' ')}>
        <p className="blog-post-review-body">{review.body}</p>

        <div className="blog-post-review-meta">
          <p className="blog-post-review-author">{review.author}</p>
          <div className="blog-post-review-rating" aria-label={`امتیاز ${review.rating} از ۵`}>
            <span className="blog-post-review-star" aria-hidden>
              ★
            </span>
            <span className="blog-post-review-score">
              {toPersianDigits(review.rating.toFixed(1))}
            </span>
          </div>
        </div>

        <button type="button" className="blog-post-review-submit" onClick={onSubmitClick}>
          ثبت نظر جدید
        </button>
      </div>
    </article>
  );
}

export function BlogPostReviewSection({
  title,
  blogPostSlug,
}: {
  title: string;
  blogPostSlug: string;
}) {
  const { data: apiReviews = [] } = useBlogPostReviews(blogPostSlug);
  const reviews = useMemo(() => {
    if (apiReviews.length > 0) {
      return apiReviews.map((review) => ({
        id: review.id,
        author: review.author,
        body: review.body,
        rating: review.rating,
      }));
    }

    return BLOG_POST_DEMO_REVIEWS;
  }, [apiReviews]);
  const [reviewWizardOpen, setReviewWizardOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev'>('next');
  const [autoPlayPaused, setAutoPlayPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollByCard = useCallback((direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) {
      return;
    }

    const card = track.querySelector<HTMLElement>('.blog-post-review-frame');
    const gap = Number.parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 35;
    const distance = (card?.offsetWidth ?? track.clientWidth) + gap;
    track.scrollBy({ left: direction * distance * -1, behavior: 'smooth' });
  }, []);

  const review = reviews[activeIndex] ?? BLOG_POST_FEATURED_REVIEW;
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

  const mobileContentClassName = [
    animating ? 'is-animating' : '',
    animating ? `is-from-${slideDirection}` : '',
    hasMultiple ? 'has-toolbar' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <div className="blog-post-reviews-header">
        <h2 id="blog-post-reviews-title" className="blog-post-section-title blog-post-section-title--reviews">
          {title}
        </h2>
        <div className="blog-post-carousel-nav blog-post-carousel-nav--reviews" aria-label="ناوبری نظرات">
          <button
            type="button"
            className="blog-post-carousel-nav-btn"
            onClick={() => scrollByCard(-1)}
            aria-label="قبلی"
          >
            <BlogPostCarouselArrow direction="prev" />
          </button>
          <button
            type="button"
            className="blog-post-carousel-nav-btn"
            onClick={() => scrollByCard(1)}
            aria-label="بعدی"
          >
            <BlogPostCarouselArrow direction="next" />
          </button>
        </div>
      </div>

      <div className="blog-post-review-mobile" role="region" aria-label="نظرات کاربران">
        <div
          ref={frameRef}
          className={`blog-post-review-mobile-shell${hasMultiple ? ' has-carousel' : ''}`}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseEnter={() => setAutoPlayPaused(true)}
          onMouseLeave={() => setAutoPlayPaused(false)}
          onFocus={() => setAutoPlayPaused(true)}
          onBlur={() => setAutoPlayPaused(false)}
        >
          {hasMultiple ? (
            <div className="blog-post-review-toolbar" role="tablist" aria-label="کنترل نظرات">
              {reviews.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  className={`blog-post-review-dot${index === activeIndex ? ' is-active' : ''}`}
                  onClick={() => goTo(index)}
                  aria-label={`نظر ${toPersianDigits(index + 1)}`}
                  aria-selected={index === activeIndex}
                />
              ))}
            </div>
          ) : null}

          <BlogPostReviewCard
            key={review.id}
            review={review}
            contentClassName={mobileContentClassName}
            onSubmitClick={() => setReviewWizardOpen(true)}
          />
        </div>
      </div>

      <div className="blog-post-review-desktop" role="region" aria-label="نظرات کاربران">
        <div ref={trackRef} className="blog-post-review-track">
          {reviews.map((item) => (
            <BlogPostReviewCard
              key={item.id}
              review={item}
              onSubmitClick={() => setReviewWizardOpen(true)}
            />
          ))}
        </div>
      </div>

      <ProductReviewWizard
        open={reviewWizardOpen}
        variant="blog"
        blogPostSlug={blogPostSlug}
        onClose={() => setReviewWizardOpen(false)}
      />
    </>
  );
}
