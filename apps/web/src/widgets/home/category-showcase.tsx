'use client';

import Link from 'next/link';
import type { CmsHomepageSections } from '@sadafgold/types';
import {
  resolveCategoryShowcase,
  resolveCategoryShowcaseImage,
  type ResolvedCategoryShowcaseItem,
} from '@/shared/config/cms-category-showcase';
import { getMediaFileUrl } from '@/shared/lib/media-url';
import { StoreImage } from '@/shared/ui/store-image';

interface CategoryShowcaseProps {
  sections: CmsHomepageSections;
}

function resolveCategoryImageSrc(
  category: ResolvedCategoryShowcaseItem,
  viewport: 'mobile' | 'desktop',
): string {
  const cmsImage = resolveCategoryShowcaseImage(category, viewport);
  if (cmsImage) {
    return cmsImage;
  }

  if (viewport === 'desktop' && category.desktopImageUrl) {
    return category.desktopImageUrl;
  }

  return getMediaFileUrl('general', category.imageFile);
}

export function CategoryShowcase({ sections }: CategoryShowcaseProps) {
  const { title, items } = resolveCategoryShowcase(sections);

  return (
    <section className="category-showcase" aria-labelledby="category-showcase-title">
      <div className="category-showcase-inner">
        <div className="category-showcase-heading">
          <h2 id="category-showcase-title" className="category-showcase-title">
            {title}
          </h2>
        </div>

        <div className="category-showcase-grid">
          {items.map((category) => (
            <Link
              key={category.slug}
              href={category.href}
              className={`category-showcase-card category-showcase-card--${category.slug}`}
            >
              <div className="category-showcase-media">
                <StoreImage
                  src={resolveCategoryImageSrc(category, 'mobile')}
                  fallbackSrc={category.fallbackImageUrl}
                  alt={category.label}
                  fill
                  priority
                  unoptimized
                  className="category-showcase-image category-showcase-image-mobile object-cover object-center lg:hidden"
                  sizes="(max-width: 390px) 33vw, 180px"
                />
                <StoreImage
                  src={resolveCategoryImageSrc(category, 'desktop')}
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
