'use client';

import Link from 'next/link';
import type { ProductSummary } from '@sadafgold/types';
import { AddToCartButton } from '@/features/cart/components/add-to-cart-button';
import { useDynamicProductPrice } from '@/features/catalog/hooks/use-dynamic-product-price';
import { formatPrice } from '@/shared/lib/format-price';
import { toPersianDigits } from '@/shared/lib/to-persian-digits';
import { StoreImage } from '@/shared/ui/store-image';

interface ProductListingCardProps {
  product: ProductSummary;
}

function formatListingWeight(weightGram: number): string {
  const value = weightGram < 1 ? weightGram.toFixed(2) : String(weightGram);
  return toPersianDigits(value);
}

function getGoldBaseToman(priceToman: number, makingFeePercent: number): number {
  if (makingFeePercent <= 0) {
    return priceToman;
  }
  return Math.round(priceToman / (1 + makingFeePercent / 100));
}

export function ProductListingCard({ product }: ProductListingCardProps) {
  const priced = useDynamicProductPrice(product);
  const goldBaseToman = getGoldBaseToman(priced.priceToman, product.makingFeePercent);

  return (
    <article className="product-listing-card">
      <Link href={`/products/${product.slug}`} className="product-listing-card-media-link">
        <div className="product-listing-card-media">
          <span className="product-listing-card-badge">
            {toPersianDigits(product.karat)} عیار
          </span>
          <StoreImage
            src={product.imageUrl}
            alt={product.title}
            fill
            className="product-listing-card-image"
            sizes="170px"
          />
        </div>
      </Link>

      <div className="product-listing-card-body">
        <Link href={`/products/${product.slug}`} className="product-listing-card-title-link">
          <h3 className="product-listing-card-title">{product.title}</h3>
        </Link>
        <p className="product-listing-card-price">{formatPrice(priced.priceToman)} تومان</p>
        <p className="product-listing-card-weight">
          وزن: {formatListingWeight(product.weightGram)} گرم | {formatPrice(goldBaseToman)} تومان
        </p>
        <AddToCartButton
          productId={product.id}
          slug={product.slug}
          title={product.title}
          priceToman={priced.priceToman}
          imageUrl={product.imageUrl}
          weightGram={product.weightGram}
          className="product-listing-card-cta"
          label="افزودن به سبد"
          disabled={product.inventory <= 0}
        />
      </div>
    </article>
  );
}
