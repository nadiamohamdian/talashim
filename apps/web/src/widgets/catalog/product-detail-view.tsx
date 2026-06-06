'use client';

import { useMemo, useState } from 'react';
import type { ProductDetails } from '@sadafgold/types';
import { StoreImage } from '@/shared/ui/store-image';
import { ProductPurchaseBox } from './product-purchase-box';
import { ProductSpecsPanel } from './product-specs-panel';
import {
  applyVariantToProduct,
  ProductVariantSelector,
  resolveDefaultVariant,
} from './product-variant-selector';

interface ProductDetailViewProps {
  product: ProductDetails;
}

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const variants = product.variants ?? [];
  const [selectedVariant, setSelectedVariant] = useState(() => resolveDefaultVariant(variants));

  const displayProduct = useMemo(
    () => applyVariantToProduct(product, selectedVariant),
    [product, selectedVariant],
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      <div className="space-y-6">
        <div className="card-luxury overflow-hidden p-4 md:p-6">
          <div className="relative aspect-square overflow-hidden rounded-xl bg-nude-50">
            <StoreImage
              src={displayProduct.imageUrl}
              alt={product.title}
              fill
              className="object-cover transition duration-300"
              sizes="(max-width: 1024px) 100vw, 60vw"
              priority
            />
          </div>
          {variants.length > 1 ? (
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {variants.map((variant) => (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => setSelectedVariant(variant)}
                  className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                    selectedVariant?.id === variant.id
                      ? 'border-amber-500 ring-2 ring-amber-200'
                      : 'border-nude-200 opacity-80 hover:opacity-100'
                  }`}
                >
                  {variant.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={variant.imageUrl}
                      alt={variant.color ?? variant.size ?? variant.sku}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center bg-nude-100 text-[10px] text-muted">
                      {variant.color ?? variant.size ?? '—'}
                    </span>
                  )}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="card-luxury p-5 md:p-6 lg:hidden">
          <ProductSpecsPanel product={displayProduct} />
        </div>
      </div>

      <div className="space-y-6">
        <div className="card-luxury p-5 md:p-6">
          <span className="badge-gold">{product.karat} عیار</span>
          <h1 className="mt-3 text-2xl font-bold leading-10 text-foreground md:text-3xl">
            {product.title}
          </h1>
          <div className="mt-4 hidden lg:block">
            <ProductSpecsPanel product={displayProduct} />
          </div>
        </div>

        <ProductPurchaseBox
          product={product}
          displayProduct={displayProduct}
          variants={variants}
          selectedVariant={selectedVariant}
          onSelectVariant={setSelectedVariant}
        />
      </div>
    </div>
  );
}
