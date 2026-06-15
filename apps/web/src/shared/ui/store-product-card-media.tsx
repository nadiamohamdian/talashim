import type { ReactNode } from 'react';
import { StoreImage } from '@/shared/ui/store-image';

export interface StoreProductCardMediaProps {
  imageUrl: string;
  hoverImageUrl?: string;
  alt: string;
  sizes?: string;
  badge?: ReactNode;
  priority?: boolean;
}

export function StoreProductCardMedia({
  imageUrl,
  hoverImageUrl,
  alt,
  sizes = '(max-width: 640px) 50vw, 170px',
  badge,
  priority,
}: StoreProductCardMediaProps) {
  const resolvedHoverUrl = hoverImageUrl?.trim();
  const showHoverLayer = Boolean(resolvedHoverUrl && resolvedHoverUrl !== imageUrl.trim());

  return (
    <div className="store-product-card-media">
      <div className="store-product-card-media-frame">
        <div className="store-product-card-media-primary">
          <StoreImage
            src={imageUrl}
            alt={alt}
            fill
            unoptimized
            priority={priority}
            className="store-product-card-image store-product-card-image-primary"
            sizes={sizes}
          />
        </div>
        {showHoverLayer ? (
          <div className="store-product-card-media-hover" aria-hidden>
            <StoreImage
              src={resolvedHoverUrl}
              alt=""
              fill
              unoptimized
              className="store-product-card-image store-product-card-image-hover"
              sizes={sizes}
            />
          </div>
        ) : null}
      </div>
      {badge}
    </div>
  );
}
