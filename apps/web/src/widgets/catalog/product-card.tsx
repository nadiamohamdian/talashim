'use client';

import Link from 'next/link';
import { isProductDiscountActive } from '@sadafgold/shared';
import type { ProductSummary } from '@sadafgold/types';
import { useDynamicProductPrice } from '@/features/catalog/hooks/use-dynamic-product-price';
import { formatPrice } from '@/shared/lib/format-price';
import { toPersianDigits } from '@/shared/lib/to-persian-digits';
import { StoreProductCardMedia } from '@/shared/ui/store-product-card-media';
import { AddToCartButton } from '@/features/cart/components/add-to-cart-button';

interface ProductCardProps {
  product: ProductSummary;
}

export function ProductCard({ product }: ProductCardProps) {
  const priced = useDynamicProductPrice(product);
  const hasActiveDiscount = isProductDiscountActive(priced);

  return (
    <article className="store-product-card product-card">
      <Link href={`/products/${product.slug}`} className="product-card-link">
        <StoreProductCardMedia
          imageUrl={product.imageUrl}
          hoverImageUrl={product.hoverImageUrl}
          alt={product.title}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 188px"
          badge={
            <span className="store-product-card-badge">
              {toPersianDigits(product.karat)} عیار
            </span>
          }
        />
      </Link>

      <div className="product-card-body">
        <Link href={`/products/${product.slug}`} className="product-card-title-link">
          <h3 className="store-product-card-title product-card-title">{product.title}</h3>
        </Link>

        {priced.compareAtPriceToman && priced.compareAtPriceToman > priced.priceToman ? (
          <p className="product-card-compare-price">
            {formatPrice(priced.compareAtPriceToman)} تومان
          </p>
        ) : null}

        <p className="store-product-card-price product-card-price">
          {formatPrice(priced.priceToman)} تومان
        </p>

        <p className="store-product-card-weight product-card-weight">
          {toPersianDigits(product.weightGram)} گرم
        </p>

        {hasActiveDiscount && product.discountPercent ? (
          <span className="product-card-discount">{product.discountPercent}٪ تخفیف</span>
        ) : null}

        <AddToCartButton
          productId={product.id}
          slug={product.slug}
          title={product.title}
          priceToman={priced.priceToman}
          imageUrl={product.imageUrl}
          weightGram={product.weightGram}
          className="product-card-cta"
          label="افزودن به سبد"
          disabled={product.inventory <= 0}
        />
      </div>
    </article>
  );
}
