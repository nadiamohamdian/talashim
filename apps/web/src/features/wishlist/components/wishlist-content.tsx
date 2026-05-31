'use client';

import Link from 'next/link';
import { Button, Skeleton } from '@sadafgold/ui';
import { StoreImage } from '@/shared/ui/store-image';
import { formatPrice } from '@/shared/lib/format-price';
import { useWishlist, useRemoveWishlistMutation } from '@/lib/api/hooks/use-wishlist';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { buildLoginHref } from '@/shared/routing/safe-redirect';

export function WishlistContent() {
  const { isAuthenticated } = useAuth();
  const { data, isLoading, isError } = useWishlist();
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
    return <p className="text-sm text-rose-600">بارگذاری علاقه‌مندی‌ها ناموفق بود.</p>;
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
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((item) => (
        <div key={item.id} className="card-luxury overflow-hidden">
          <Link href={`/products/${item.product.slug}`} className="block">
            <div className="relative aspect-[4/3] bg-nude-100">
              <StoreImage
                src={item.product.imageUrl}
                alt={item.product.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold">{item.product.title}</h3>
              <p className="mt-1 text-sm text-gold-dark">
                {formatPrice(item.product.priceToman)} تومان
              </p>
            </div>
          </Link>
          <div className="border-t border-nude-200 px-4 py-3">
            <Button
              variant="outline"
              className="w-full text-xs"
              disabled={removeMutation.isPending}
              onClick={() => removeMutation.mutate(item.productId)}
            >
              حذف از علاقه‌مندی
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
