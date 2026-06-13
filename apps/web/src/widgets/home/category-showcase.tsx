'use client';

import Link from 'next/link';
import {
  HOME_CATEGORY_SHOWCASE,
  type HomeCategoryShowcaseItem,
} from '@/shared/config/storefront-ia';
import { getMediaFileUrl } from '@/shared/lib/media-url';
import { StoreImage } from '@/shared/ui/store-image';

function resolveCategoryImage(
  category: HomeCategoryShowcaseItem,
  viewport: 'mobile' | 'desktop',
): string {
  if (viewport === 'desktop' && category.desktopImageUrl) {
    return category.desktopImageUrl;
  }

  return getMediaFileUrl('general', category.imageFile);
}

export function CategoryShowcase() {
  return (
    <section className="category-showcase" aria-labelledby="category-showcase-title">
      <div className="category-showcase-inner">
        <div className="category-showcase-heading">
          <span className="category-showcase-watermark" aria-hidden>
            Product Categories
          </span>
          <h2 id="category-showcase-title" className="category-showcase-title">
            دسته بندی محصولات
          </h2>
        </div>

        <div className="category-showcase-grid">
          {HOME_CATEGORY_SHOWCASE.map((category) => (
            <Link
              key={category.slug}
              href={category.href}
              className={`category-showcase-card category-showcase-card--${category.slug}`}
            >
              <div className="category-showcase-media">
                <StoreImage
                  src={resolveCategoryImage(category, 'mobile')}
                  fallbackSrc={category.fallbackImageUrl}
                  alt={category.label}
                  fill
                  priority
                  unoptimized
                  className="category-showcase-image category-showcase-image-mobile object-cover object-center lg:hidden"
                  sizes="(max-width: 390px) 33vw, 180px"
                />
                <StoreImage
                  src={resolveCategoryImage(category, 'desktop')}
                  fallbackSrc={category.fallbackImageUrl}
                  alt=""
                  fill
                  priority
                  unoptimized
                  className="category-showcase-image category-showcase-image-desktop hidden object-cover object-center lg:block"
                  sizes="(max-width: 1024px) 33vw, 293px"
                  aria-hidden
                />
              </div>
              <p className="category-showcase-label">{category.label}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
