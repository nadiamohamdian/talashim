import { HOME_BRAND_EDITORIAL } from '@/shared/config/storefront-ia';

export function BrandEditorialShowcase() {
  const { title, description, leftImageUrl, rightImageUrl } = HOME_BRAND_EDITORIAL;

  return (
    <section className="brand-editorial-showcase" aria-labelledby="brand-editorial-title">
      <div className="brand-editorial-showcase-inner">
        <div className="brand-editorial-showcase-media brand-editorial-showcase-media--left" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={leftImageUrl}
            alt=""
            className="brand-editorial-showcase-image"
            decoding="async"
          />
        </div>

        <div className="brand-editorial-showcase-copy">
          <h2 id="brand-editorial-title" className="brand-editorial-showcase-title">
            {title}
          </h2>
          <p className="brand-editorial-showcase-description">{description}</p>
        </div>

        <div className="brand-editorial-showcase-media brand-editorial-showcase-media--right" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={rightImageUrl}
            alt=""
            className="brand-editorial-showcase-image"
            decoding="async"
          />
        </div>
      </div>
    </section>
  );
}
