import { BLOG_POST_FEATURED_REVIEW } from '@/shared/config/blog-post-page';
import { toPersianDigits } from '@/shared/lib/to-persian-digits';

export function BlogPostReviewSection() {
  const review = BLOG_POST_FEATURED_REVIEW;

  return (
    <div className="blog-post-review-frame">
      <span className="blog-post-review-line blog-post-review-line-top" aria-hidden />
      <span className="blog-post-review-line blog-post-review-line-left" aria-hidden />
      <span className="blog-post-review-line blog-post-review-line-bottom" aria-hidden />
      <span className="blog-post-review-line blog-post-review-line-right" aria-hidden />
      <span className="blog-post-review-quote blog-post-review-quote-open" aria-hidden />
      <span className="blog-post-review-quote blog-post-review-quote-close" aria-hidden />

      <div className="blog-post-review-content">
        <p className="blog-post-review-body">{review.body}</p>

        <div className="blog-post-review-footer">
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

          <button type="button" className="blog-post-review-submit">
            ثبت نظر جدید
          </button>
        </div>
      </div>
    </div>
  );
}
