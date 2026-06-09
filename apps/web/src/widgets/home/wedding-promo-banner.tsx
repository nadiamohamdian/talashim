'use client';

import Link from 'next/link';
import { HOME_WEDDING_PROMO } from '@/shared/config/storefront-ia';
import { StoreImage } from '@/shared/ui/store-image';

export function WeddingPromoBanner() {
  const { title, subtitle, ctaLabel, href, ringImageUrl } = HOME_WEDDING_PROMO;

  return (
    <section className="wedding-promo-banner" aria-labelledby="wedding-promo-title">
      <div className="wedding-promo-banner-inner">
        <div className="wedding-promo-banner-copy">
          <h2 id="wedding-promo-title" className="wedding-promo-banner-title">
            {title}
          </h2>
          <p className="wedding-promo-banner-subtitle">{subtitle}</p>
        </div>

        <Link href={href} className="wedding-promo-banner-cta">
          {ctaLabel}
          <span aria-hidden className="wedding-promo-banner-cta-arrow">
            ←
          </span>
        </Link>

        <StoreImage
          src={ringImageUrl}
          alt=""
          width={39}
          height={99}
          sizes="120px"
          className="wedding-promo-banner-ring"
          priority={false}
        />
      </div>
    </section>
  );
}
