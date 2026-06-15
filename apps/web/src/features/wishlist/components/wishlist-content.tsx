'use client';

import Link from 'next/link';
import { Button, Skeleton } from '@sadafgold/ui';
import { formatPrice } from '@/shared/lib/format-price';
import { toPersianDigits } from '@/shared/lib/to-persian-digits';
import { StoreProductCardMedia } from '@/shared/ui/store-product-card-media';
import { getApiErrorMessage } from '@/lib/api/client';
import { useWishlist, useRemoveWishlistMutation } from '@/lib/api/hooks/use-wishlist';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { buildLoginHref } from '@/shared/routing/safe-redirect';

function formatListingWeight(weightGram: number): string {
  const value = weightGram < 1 ? weightGram.toFixed(2) : String(weightGram);
  return toPersianDigits(value);
}

export function WishlistContent() {
  const { isAuthenticated } = useAuth();
  const { data, isLoading, isError, error, refetch, isFetching } = useWishlist();
  const removeMutation = useRemoveWishlistMutation();

  if (!isAuthenticated) {
    return (
      <div className="card-luxury p-12 text-center">
        <p className="text-muted">برای مشاهده علاقه‌مندی‌ها وارد شوید.</p>
        <Link href={buildLoginHref('/wishlist')} className="btn-gold mt-6 inline-flex">
          ورود
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return <Skeleton className="h-64 w-full rounded-2xl" />;
  }

  if (isError) {
    return (
      <div className="card-luxury space-y-3 p-6 text-center">
        <p className="text-sm text-rose-600">
          {getApiErrorMessage(error, 'بارگذاری علاقه‌مندی‌ها ناموفق بود.')}
        </p>
        <Button variant="outline" size="sm" disabled={isFetching} onClick={() => void refetch()}>
          تلاش مجدد
        </Button>
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="card-luxury p-12 text-center">
        <p className="text-muted">لیست علاقه‌مندی‌های شما خالی است.</p>
        <Link href="/products" className="btn-gold mt-6 inline-flex">
          مشاهده محصولات
        </Link>
      </div>
    );
  }

  return (
    <div className="wishlist-grid">
      {data.map((item) => (
        <article key={item.id} className="store-product-card wishlist-card">
          <Link href={`/products/${item.product.slug}`} className="wishlist-card-link">
            <StoreProductCardMedia
              imageUrl={item.product.imageUrl}
              hoverImageUrl={item.product.hoverImageUrl}
              alt={item.product.title}
              sizes="(max-width: 640px) 50vw, 188px"
              badge={
                <span className="store-product-card-badge">
                  {toPersianDigits(item.product.karat)} عیار
                </span>
              }
            />
            <div className="wishlist-card-body">
              <h3 className="store-product-card-title wishlist-card-title">{item.product.title}</h3>
              <p className="store-product-card-price wishlist-card-price">
                {formatPrice(item.product.priceToman)} تومان
              </p>
              <p className="store-product-card-weight wishlist-card-weight">
                {formatListingWeight(item.product.weightGram)} گرم
              </p>
            </div>
          </Link>
          <div className="wishlist-card-actions">
            <Button
              variant="outline"
              className="w-full text-xs"
              disabled={removeMutation.isPending}
              onClick={() => removeMutation.mutate(item.productId)}
            >
              حذف از علاقه‌مندی
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}
