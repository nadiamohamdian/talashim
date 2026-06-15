'use client';

import Link from 'next/link';
import type { ProductSummary } from '@sadafgold/types';
import { useDynamicProductPrice } from '@/features/catalog/hooks/use-dynamic-product-price';
import { formatPrice } from '@/shared/lib/format-price';
import { toPersianDigits } from '@/shared/lib/to-persian-digits';
import { StoreProductCardMedia } from '@/shared/ui/store-product-card-media';

interface ProductListingCardProps {
  product: ProductSummary;
}

function formatListingWeight(weightGram: number): string {
  const value = weightGram < 1 ? weightGram.toFixed(2) : String(weightGram);
  return toPersianDigits(value);
}

export function ProductListingCard({ product }: ProductListingCardProps) {
  const priced = useDynamicProductPrice(product);

  return (
    <article className="store-product-card product-listing-card">
      <Link href={`/products/${product.slug}`} className="product-listing-card-link">
        <StoreProductCardMedia
          imageUrl={product.imageUrl}
          hoverImageUrl={product.hoverImageUrl}
          alt={product.title}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 16vw"
        />
        <h3 className="store-product-card-title product-listing-card-title">{product.title}</h3>
        <p className="store-product-card-price product-listing-card-price">
          {formatPrice(priced.priceToman)} تومان
        </p>
        <p className="store-product-card-weight product-listing-card-weight">
          {formatListingWeight(product.weightGram)} گرم
        </p>
      </Link>
    </article>
  );
}
