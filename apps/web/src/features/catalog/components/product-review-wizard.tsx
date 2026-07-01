'use client';

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useQueryClient } from '@tanstack/react-query';
import { submitProductReview } from '@/features/catalog/api/product-review-api';
import { submitBlogPostReview } from '@/features/blog/api/blog-review-api';
import { ApiClientError, getApiErrorMessage } from '@/lib/api/client';
import { queryKeys } from '@/lib/api/query-keys';

type WizardStep = 'comment' | 'rating' | 'phone' | 'success';

type ReviewWizardVariant = 'product' | 'blog';

interface ProductReviewWizardProps {
  open: boolean;
  productSlug?: string;
  blogPostSlug?: string;
  variant?: ReviewWizardVariant;
  onClose: () => void;
}

const SUCCESS_MESSAGES: Record<ReviewWizardVariant, string> = {
  product:
    'دیدگاه شما با موفقیت ثبت شد. پس از بررسی و تأیید مدیر، در صفحه محصول نمایش داده می‌شود.',
  blog: 'نظر شما با موفقیت ثبت شد. پس از بررسی و تأیید مدیر، در این صفحه نمایش داده می‌شود.',
};

const PENDING_REVIEW_MESSAGE =
  'دیدگاه شما قبلاً ثبت شده و در انتظار تأیید است. پس از تأیید مدیر، نمایش داده می‌شود.';

const IR_MOBILE_REGEX = /^09\d{9}$/;

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      className="product-review-wizard-star"
      width="28"
      height="28"
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
    >
      <path
        d="M16 2.5L19.43 11.73H29.36L21.47 17.77L24.9 27L16 21L7.1 27L10.53 17.77L2.64 11.73H12.57L16 2.5Z"
        fill={filled ? '#FFB900' : 'transparent'}
        stroke="#FFB900"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ProductReviewWizard({
  open,
  productSlug,
  blogPostSlug,
  variant = 'product',
  onClose,
}: ProductReviewWizardProps) {
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<WizardStep>('comment');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStep('comment');
    setComment('');
    setRating(0);
    setPhone('');
    setError(null);
    setSubmitting(false);
    setSuccessMessage(null);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !submitting) {
        handleClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [handleClose, open, submitting]);

  const handleContinueComment = () => {
    if (comment.trim().length < 10) {
      setError('دیدگاه باید حداقل ۱۰ کاراکتر باشد');
      return;
    }
    setError(null);
    setStep('rating');
  };

  const handleSelectRating = (value: number) => {
    setRating(value);
    setError(null);
    setStep('phone');
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setError(null);
    setStep('success');
  };

  const handleSubmit = async () => {
    const normalizedPhone = phone.trim();
    if (!IR_MOBILE_REGEX.test(normalizedPhone)) {
      setError('شماره موبایل معتبر نیست (مثال: 09121234567)');
      return;
    }
    if (rating < 1 || rating > 5) {
      setError('لطفاً امتیاز را انتخاب کنید');
      setStep('rating');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      if (variant === 'blog') {
        const slug = blogPostSlug?.trim();
        if (!slug) {
          setError('امکان ثبت دیدگاه در حال حاضر وجود ندارد');
          return;
        }

        const response = await submitBlogPostReview(slug, {
          body: comment.trim(),
          rating,
          phone: normalizedPhone,
        });
        await queryClient.invalidateQueries({
          queryKey: queryKeys.blog.reviews(slug),
        });
        showSuccess(response.message || SUCCESS_MESSAGES.blog);
        return;
      }

      const slug = productSlug?.trim();
      if (!slug) {
        setError('امکان ثبت دیدگاه در حال حاضر وجود ندارد');
        return;
      }

      const response = await submitProductReview(slug, {
        body: comment.trim(),
        rating,
        phone: normalizedPhone,
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.products.reviews(slug),
      });
      showSuccess(response.message || SUCCESS_MESSAGES.product);
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 409) {
        showSuccess(PENDING_REVIEW_MESSAGE);
        return;
      }
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted || !open) {
    return null;
  }

  return createPortal(
    <div className="product-review-wizard" role="presentation">
      <button
        type="button"
        className="product-review-wizard-overlay"
        aria-label="بستن"
        onClick={handleClose}
      />
      <div
        className="product-review-wizard-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-review-wizard-title"
      >
        {step === 'success' ? (
          <>
            <button
              type="button"
              className="product-review-wizard-close"
              aria-label="بستن"
              onClick={handleClose}
            >
              ×
            </button>
            <div className="product-review-wizard-success-panel">
              <span className="product-review-wizard-success-icon" aria-hidden>
                ✓
              </span>
              <p id="product-review-wizard-title" className="product-review-wizard-success">
                {successMessage ?? SUCCESS_MESSAGES[variant]}
              </p>
              <button
                type="button"
                className="product-review-wizard-btn product-review-wizard-btn-success"
                onClick={handleClose}
              >
                متوجه شدم
              </button>
            </div>
          </>
        ) : null}

        {step === 'comment' ? (
          <>
            <h2 id="product-review-wizard-title" className="product-review-wizard-title">
              دیدگاه خود را با ما در میان بگذارید
            </h2>
            <textarea
              className="product-review-wizard-textarea"
              placeholder="دیدگاه شما"
              value={comment}
              rows={6}
              maxLength={2000}
              onChange={(event) => setComment(event.target.value)}
            />
            {error ? <p className="product-review-wizard-error">{error}</p> : null}
            <div className="product-review-wizard-actions">
              <button
                type="button"
                className="product-review-wizard-btn"
                onClick={handleContinueComment}
              >
                ادامه
              </button>
            </div>
          </>
        ) : null}

        {step === 'rating' ? (
          <>
            <h2 id="product-review-wizard-title" className="product-review-wizard-title">
              تجربه شما چقدر رضایت‌بخش بود؟
            </h2>
            <div className="product-review-wizard-stars" role="radiogroup" aria-label="امتیاز">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={rating === value}
                  className="product-review-wizard-star-btn"
                  onClick={() => handleSelectRating(value)}
                >
                  <StarIcon filled={rating >= value} />
                </button>
              ))}
            </div>
            {error ? <p className="product-review-wizard-error">{error}</p> : null}
          </>
        ) : null}

        {step === 'phone' ? (
          <>
            <h2 id="product-review-wizard-title" className="product-review-wizard-title">
              برای ثبت دیدگاه، شماره موبایل خود را وارد نمائید
            </h2>
            <div className="product-review-wizard-phone-row">
              <button
                type="button"
                className="product-review-wizard-btn product-review-wizard-btn-send"
                disabled={submitting}
                onClick={() => void handleSubmit()}
              >
                {submitting ? '...' : 'ارسال'}
              </button>
              <input
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                dir="ltr"
                className="product-review-wizard-phone-input"
                placeholder="09*********"
                value={phone}
                maxLength={11}
                onChange={(event) => setPhone(event.target.value.replace(/\D/g, ''))}
              />
            </div>
            {error ? <p className="product-review-wizard-error">{error}</p> : null}
          </>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
