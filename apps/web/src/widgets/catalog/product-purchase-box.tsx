'use client';

import type { ProductDetails, ProductVariant } from '@sadafgold/types';
import { useDynamicProductPrice } from '@/features/catalog/hooks/use-dynamic-product-price';
import { formatPricingBreakdown } from '@/shared/lib/live-gold-pricing';
import { useState } from 'react';
import { getApiErrorMessage } from '@/lib/api/client';
import { AddToCartButton } from '@/features/cart/components/add-to-cart-button';
import { formatPrice } from '@/shared/lib/format-price';
import { IconHeart, IconMinus, IconPlus } from '@/shared/ui/icons';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useAddWishlistMutation, useWishlist } from '@/lib/api/hooks/use-wishlist';
import { buildLoginHref } from '@/shared/routing/safe-redirect';
import Link from 'next/link';
import { ProductVariantSelector } from './product-variant-selector';

interface ProductPurchaseBoxProps {
  product: ProductDetails;
  displayProduct?: ProductDetails;
  variants?: ProductVariant[];
  selectedVariant?: ProductVariant | null;
  onSelectVariant?: (variant: ProductVariant) => void;
  compact?: boolean;
}

export function ProductPurchaseBox({
  product,
  displayProduct,
  variants = [],
  selectedVariant = null,
  onSelectVariant,
  compact = false,
}: ProductPurchaseBoxProps) {
  const active = displayProduct ?? product;
  const [quantity, setQuantity] = useState(1);
  const [wishlistError, setWishlistError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const { data: wishlist } = useWishlist();
  const addWishlist = useAddWishlistMutation();
  const isWishlisted = wishlist?.some((item) => item.productId === product.id) ?? false;
  const priced = useDynamicProductPrice(active);
  const pricing = priced.pricing;
  const breakdown = pricing ? formatPricingBreakdown(pricing, active.weightGram) : null;
  const maxQty = Math.max(1, active.inventory);

  const decrease = () => setQuantity((value) => Math.max(1, value - 1));
  const increase = () => setQuantity((value) => Math.min(maxQty, value + 1));

  return (
    <aside
      className={`card-luxury sticky top-24 space-y-4 p-5 ${compact ? 'shadow-sm' : 'shadow-md'}`}
    >
      <div>
        <p className="text-sm text-muted">قیمت نهایی (لحظه‌ای)</p>
        <p className="mt-1 text-3xl font-bold text-gold-dark">
          {formatPrice(priced.priceToman)}{' '}
          <span className="text-base font-normal text-muted">تومان</span>
        </p>
        {pricing ? (
          <p className="mt-1 text-xs text-muted">
            بروزرسانی: {new Date(pricing.pricedAt).toLocaleString('fa-IR')}
          </p>
        ) : null}
      </div>

      {breakdown && pricing ? (
        <div className="space-y-2 rounded-xl border border-nude-200 bg-nude-50/60 p-3 text-xs">
          <div className="flex justify-between gap-3">
            <span className="text-muted">ارزش خام طلا ({active.weightGram} گرم)</span>
            <span className="font-medium">{formatPrice(breakdown.metalValue)} تومان</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-muted">اجرت ({active.makingFeePercent}٪)</span>
            <span className="font-medium">{formatPrice(breakdown.wageAmount)} تومان</span>
          </div>
          <div className="flex justify-between gap-3 border-t border-nude-200 pt-2 font-semibold text-foreground">
            <span>قیمت واقعی</span>
            <span className="text-gold-dark">{formatPrice(pricing.finalPriceToman)} تومان</span>
          </div>
        </div>
      ) : null}

      {variants.length > 0 && onSelectVariant ? (
        <ProductVariantSelector
          variants={variants}
          selectedId={selectedVariant?.id ?? null}
          onSelect={(variant) => {
            onSelectVariant(variant);
            setQuantity(1);
          }}
        />
      ) : null}

      <div className="grid grid-cols-2 gap-3 text-sm">
        <label className="space-y-1">
          <span className="text-xs text-muted">وزن</span>
          <div className="rounded-lg border border-nude-200 bg-white px-3 py-2 font-medium">
            {active.weightGram} گرم
          </div>
        </label>
        <label className="space-y-1">
          <span className="text-xs text-muted">تعداد</span>
          <div className="flex items-center rounded-lg border border-nude-200 bg-white">
            <button
              type="button"
              className="px-3 py-2 text-muted hover:text-foreground"
              onClick={decrease}
              aria-label="کاهش تعداد"
            >
              <IconMinus className="h-4 w-4" />
            </button>
            <span className="flex-1 text-center font-semibold">{quantity}</span>
            <button
              type="button"
              className="px-3 py-2 text-muted hover:text-foreground"
              onClick={increase}
              aria-label="افزایش تعداد"
              disabled={quantity >= maxQty}
            >
              <IconPlus className="h-4 w-4" />
            </button>
          </div>
        </label>
      </div>

      <AddToCartButton
        productId={product.id}
        slug={product.slug}
        title={product.title}
        priceToman={priced.priceToman}
        imageUrl={active.imageUrl}
        weightGram={active.weightGram}
        quantity={quantity}
        disabled={active.inventory <= 0}
        className="btn-gold w-full py-3.5 text-base"
        label={active.inventory > 0 ? 'افزودن به سبد خرید' : 'ناموجود'}
      />

      <div className="flex flex-col gap-1 border-t border-nude-200 pt-3 text-xs text-muted">
        <div className="flex items-center justify-between gap-3">
          {isAuthenticated ? (
            <button
              type="button"
              className="inline-flex items-center gap-1.5 hover:text-gold-dark disabled:opacity-50"
              disabled={addWishlist.isPending || isWishlisted}
              onClick={() => {
                setWishlistError(null);
                addWishlist.mutate(product.id, {
                  onError: (error) => {
                    setWishlistError(
                      getApiErrorMessage(error, 'افزودن به علاقه‌مندی‌ها ناموفق بود'),
                    );
                  },
                });
              }}
            >
              <IconHeart className="h-4 w-4" />
              {isWishlisted ? 'در علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی'}
            </button>
          ) : (
            <Link
              href={buildLoginHref(`/products/${product.slug}`)}
              className="inline-flex items-center gap-1.5 hover:text-gold-dark"
            >
              <IconHeart className="h-4 w-4" />
              ورود برای علاقه‌مندی
            </Link>
          )}
          <span>{active.inventory > 0 ? `${active.inventory} عدد موجود` : 'ناموجود'}</span>
        </div>
        {wishlistError ? (
          <p className="text-xs text-red-600" role="alert">
            {wishlistError}
          </p>
        ) : null}
      </div>
    </aside>
  );
}
