'use client';

import type { ProductDetails } from '@sadafgold/types';
import { formatPricingBreakdown } from '@/shared/lib/live-gold-pricing';
import { useState } from 'react';
import { AddToCartButton } from '@/features/cart/components/add-to-cart-button';
import { formatPrice } from '@/shared/lib/format-price';
import { IconHeart, IconMinus, IconPlus } from '@/shared/ui/icons';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useAddWishlistMutation, useWishlist } from '@/lib/api/hooks/use-wishlist';
import { buildLoginHref } from '@/shared/routing/safe-redirect';
import Link from 'next/link';

interface ProductPurchaseBoxProps {
  product: ProductDetails;
  compact?: boolean;
}

export function ProductPurchaseBox({ product, compact = false }: ProductPurchaseBoxProps) {
  const [quantity, setQuantity] = useState(1);
  const { isAuthenticated } = useAuth();
  const { data: wishlist } = useWishlist();
  const addWishlist = useAddWishlistMutation();
  const isWishlisted = wishlist?.some((item) => item.productId === product.id) ?? false;
  const pricing = product.pricing;
  const breakdown = pricing ? formatPricingBreakdown(pricing, product.weightGram) : null;

  const decrease = () => setQuantity((value) => Math.max(1, value - 1));
  const increase = () => setQuantity((value) => Math.min(product.inventory, value + 1));

  return (
    <aside
      className={`card-luxury sticky top-24 space-y-4 p-5 ${compact ? 'shadow-sm' : 'shadow-md'}`}
    >
      <div>
        <p className="text-sm text-muted">قیمت نهایی (لحظه‌ای)</p>
        <p className="mt-1 text-3xl font-bold text-gold-dark">
          {formatPrice(product.priceToman)}{' '}
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
            <span className="text-muted">ارزش خام طلا ({product.weightGram} گرم)</span>
            <span className="font-medium">{formatPrice(breakdown.metalValue)} تومان</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-muted">اجرت ({product.makingFeePercent}٪)</span>
            <span className="font-medium">{formatPrice(breakdown.wageAmount)} تومان</span>
          </div>
          <div className="flex justify-between gap-3 border-t border-nude-200 pt-2 font-semibold text-foreground">
            <span>قیمت واقعی</span>
            <span className="text-gold-dark">{formatPrice(pricing.finalPriceToman)} تومان</span>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 text-sm">
        <label className="space-y-1">
          <span className="text-xs text-muted">وزن</span>
          <div className="rounded-lg border border-nude-200 bg-white px-3 py-2 font-medium">
            {product.weightGram} گرم
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
              disabled={quantity >= product.inventory}
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
        priceToman={product.priceToman}
        imageUrl={product.imageUrl}
        weightGram={product.weightGram}
        quantity={quantity}
        className="btn-gold w-full py-3.5 text-base"
        label="افزودن به سبد خرید"
      />

      <div className="flex items-center justify-between gap-3 border-t border-nude-200 pt-3 text-xs text-muted">
        {isAuthenticated ? (
          <button
            type="button"
            className="inline-flex items-center gap-1.5 hover:text-gold-dark disabled:opacity-50"
            disabled={addWishlist.isPending || isWishlisted}
            onClick={() => addWishlist.mutate(product.id)}
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
        <span>{product.inventory > 0 ? `${product.inventory} عدد موجود` : 'ناموجود'}</span>
      </div>
    </aside>
  );
}
