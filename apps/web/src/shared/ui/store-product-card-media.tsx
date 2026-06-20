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
  const hoverImageSrc = showHoverLayer ? resolvedHoverUrl : null;

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
        {hoverImageSrc ? (
          <div className="store-product-card-media-hover" aria-hidden>
            <StoreImage
              src={hoverImageSrc}
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
