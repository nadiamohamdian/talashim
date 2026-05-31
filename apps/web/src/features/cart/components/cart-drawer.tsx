'use client';

import Link from 'next/link';
import { Card } from '@sadafgold/ui';
import { buildLoginHref } from '@/shared/routing/safe-redirect';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useCartStore } from '../model/cart-store';
import { formatPrice } from '@/shared/lib/format-price';

export function CartDrawer() {
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) =>
    s.items.reduce((sum, line) => sum + line.quantity * line.priceToman, 0),
  );
  const { isAuthenticated } = useAuth();

  return (
    <Card className="w-full max-w-sm p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-stone-950">سبد خرید</h3>
        <span className="text-sm text-stone-500">{items.length} آیتم</span>
      </div>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-2xl bg-stone-50 px-4 py-3"
          >
            <div>
              <p className="font-medium text-stone-900">{item.title}</p>
              <p className="text-sm text-stone-500">تعداد: {item.quantity}</p>
            </div>
            <p className="font-semibold text-stone-950">
              {formatPrice(item.priceToman)} تومان
            </p>
          </div>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-stone-200 pt-4">
        <p className="text-sm text-stone-500">جمع کل</p>
        <p className="text-lg font-bold text-stone-950">
          {formatPrice(total)} تومان
        </p>
      </div>
      <Link
        href={isAuthenticated ? '/checkout' : buildLoginHref('/checkout')}
        className="mt-4 block w-full rounded-full bg-stone-900 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-stone-800 dark:bg-zinc-100 dark:text-zinc-950"
      >
        {isAuthenticated ? 'ادامه فرایند سفارش' : 'ورود برای تسویه'}
      </Link>
    </Card>
  );
}
