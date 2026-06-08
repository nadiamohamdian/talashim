'use client';

import Link from 'next/link';
import { HOME_CATEGORY_SHOWCASE } from '@/shared/config/storefront-ia';
import { getMediaFileUrl } from '@/shared/lib/media-url';
import { StoreImage } from '@/shared/ui/store-image';

export function CategoryShowcase() {
  return (
    <section className="category-showcase" aria-labelledby="category-showcase-title">
      <div className="category-showcase-inner">
        <h2 id="category-showcase-title" className="category-showcase-title">
          دسته بندی محصولات
        </h2>

        <div className="category-showcase-grid">
          {HOME_CATEGORY_SHOWCASE.map((category) => (
            <Link
              key={category.slug}
              href={category.href}
              className="category-showcase-card"
            >
              <div className="category-showcase-media">
                <StoreImage
                  src={getMediaFileUrl('general', category.imageFile)}
                  fallbackSrc={category.fallbackImageUrl}
                  alt={category.label}
                  fill
                  className="category-showcase-image object-cover object-center"
                  sizes="(max-width: 390px) 33vw, 180px"
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
