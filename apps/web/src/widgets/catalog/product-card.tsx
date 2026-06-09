'use client';

import Link from 'next/link';
import { isProductDiscountActive } from '@sadafgold/shared';
import type { ProductSummary } from '@sadafgold/types';
import { useDynamicProductPrice } from '@/features/catalog/hooks/use-dynamic-product-price';
import { formatPrice } from '@/shared/lib/format-price';
import { StoreImage } from '@/shared/ui/store-image';
import { AddToCartButton } from '@/features/cart/components/add-to-cart-button';

interface ProductCardProps {
  product: ProductSummary;
}

export function ProductCard({ product }: ProductCardProps) {
  const priced = useDynamicProductPrice(product);
  const hasActiveDiscount = isProductDiscountActive(priced);
  const hoverImageUrl = product.hoverImageUrl?.trim() || product.imageUrl;

  return (
    <article className="card-luxury group">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="product-card-media">
          <div className="product-card-media-primary">
            <StoreImage
              src={product.imageUrl}
              alt={product.title}
              fill
              className="product-card-image product-card-image-primary"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          </div>
          <div className="product-card-media-hover" aria-hidden>
            <StoreImage
              src={hoverImageUrl}
              alt=""
              fill
              className="product-card-image product-card-image-hover"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          </div>
          <div className="absolute left-3 top-3 z-[1]">
            <span className="badge-gold">{product.karat} عیار</span>
          </div>
        </div>
      </Link>
      <div className="space-y-2.5 p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="line-clamp-2 min-h-[2.75rem] text-sm font-semibold leading-6 text-foreground transition hover:text-gold-dark">
            {product.title}
          </h3>
        </Link>
        <p className="text-xs text-muted">وزن {product.weightGram} گرم</p>
        <div className="space-y-1">
          {priced.compareAtPriceToman && priced.compareAtPriceToman > priced.priceToman ? (
            <p className="text-xs text-muted line-through">
              {formatPrice(priced.compareAtPriceToman)} تومان
            </p>
          ) : null}
          <p className="text-base font-bold text-gold-dark">
            {formatPrice(priced.priceToman)}{' '}
            <span className="text-xs font-normal text-muted">تومان</span>
          </p>
          {hasActiveDiscount && product.discountPercent ? (
            <span className="badge-gold inline-flex text-[11px]">
              {product.discountPercent}٪ تخفیف
            </span>
          ) : null}
        </div>
        {priced.pricing ? (
          <p className="text-[11px] leading-5 text-muted">
            قیمت لحظه‌ای: ارزش طلا + اجرت {product.makingFeePercent}٪
          </p>
        ) : null}
        <AddToCartButton
          productId={product.id}
          slug={product.slug}
          title={product.title}
          priceToman={priced.priceToman}
          imageUrl={product.imageUrl}
          weightGram={product.weightGram}
          className="btn-gold w-full py-2.5 text-sm"
          label="افزودن به سبد"
        />
      </div>
    </article>
  );
}
