'use client';

import Link from 'next/link';
import { HOME_WEDDING_PROMO } from '@/shared/config/storefront-ia';
import { StoreImage } from '@/shared/ui/store-image';

function WeddingPromoCtaArrow() {
  return (
    <svg
      viewBox="0 0 10.2439 28.7317"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="wedding-promo-banner-cta-arrow"
    >
      <path
        d="M5.12179 28.2317V0.50005"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.74389 5.12195 5.12195.5.5 5.12195"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function WeddingPromoBanner() {
  const { title, subtitle, ctaLabel, href, ringImageUrl } = HOME_WEDDING_PROMO;

  return (
    <section className="wedding-promo-banner" aria-labelledby="wedding-promo-title">
      <Link href={href} className="wedding-promo-banner-inner">
        <div className="wedding-promo-banner-content">
          <div className="wedding-promo-banner-copy">
            <h2 id="wedding-promo-title" className="wedding-promo-banner-title">
              {title}
            </h2>
            <p className="wedding-promo-banner-subtitle">{subtitle}</p>
          </div>

          <div className="wedding-promo-banner-cta">
            <WeddingPromoCtaArrow />
            <span className="wedding-promo-banner-cta-label">{ctaLabel}</span>
          </div>
        </div>

        <div className="wedding-promo-banner-ring-wrap" aria-hidden>
          <StoreImage
            src={ringImageUrl}
            alt=""
            width={99}
            height={39}
            unoptimized
            className="wedding-promo-banner-ring"
            sizes="120px"
          />
        </div>
      </Link>
    </section>
  );
}
