import Link from 'next/link';
import { HOME_WEDDING_PROMO } from '@/shared/config/storefront-ia';
import { StoreImage } from '@/shared/ui/store-image';

function WeddingRingsPromoArrow() {
  return (
    <svg
      viewBox="0 0 10.2439 28.7317"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="wedding-rings-promo-cta-arrow"
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
  const { title, subtitle, desktopSubtitle, ctaLabel, href, imageUrl } = HOME_WEDDING_PROMO;

  return (
    <section className="wedding-rings-promo" aria-labelledby="wedding-rings-promo-title">
      <Link href={href} className="wedding-rings-promo-card">
        <div className="wedding-rings-promo-media" aria-hidden>
          <StoreImage
            src={imageUrl}
            alt=""
            fill
            unoptimized
            sizes="(min-width: 1024px) 100vw, 100vw"
            className="wedding-rings-promo-image"
          />
        </div>

        <div className="wedding-rings-promo-overlay">
          <div className="wedding-rings-promo-panel">
            <h2 id="wedding-rings-promo-title" className="wedding-rings-promo-title">
              {title}
            </h2>
            <p className="wedding-rings-promo-subtitle wedding-rings-promo-subtitle--mobile">
              {subtitle}
            </p>
            <p className="wedding-rings-promo-subtitle wedding-rings-promo-subtitle--desktop">
              {desktopSubtitle}
            </p>
            <div className="wedding-rings-promo-cta">
              <WeddingRingsPromoArrow />
              <span className="wedding-rings-promo-cta-label">{ctaLabel}</span>
            </div>
          </div>
        </div>
      </Link>
    </section>
  );
}
