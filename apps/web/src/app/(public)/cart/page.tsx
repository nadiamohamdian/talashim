import type { Metadata } from 'next';
import { CartPageContent } from '@/features/cart/components/cart-page-content';

export const metadata: Metadata = {
  title: 'سبد خرید',
  description: 'مشاهده و ویرایش سبد خرید',
};

export default function CartPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">سبد خرید</h1>
        <p className="mt-1 text-sm text-stone-500">
          محصولات انتخاب‌شده — ورود فقط هنگام تسویه لازم است.
        </p>
      </div>
      <CartPageContent />
    </div>
  );
}
