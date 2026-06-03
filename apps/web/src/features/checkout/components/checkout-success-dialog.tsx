'use client';

import Link from 'next/link';
import { Button } from '@sadafgold/ui';

export function CheckoutSuccessDialog({
  orderNumber,
  message,
  onClose,
}: {
  orderNumber: string;
  message: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-stone-950/40" aria-label="بستن" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-3xl border border-nude-200 bg-white p-8 text-center shadow-2xl">
        <h2 className="text-xl font-bold">سفارش با موفقیت ثبت شد</h2>
        <p className="mt-2 font-mono text-sm text-gold-dark">{orderNumber}</p>
        <p className="mt-3 text-sm text-muted">{message}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/orders" className="inline-flex rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-stone-950">
            مشاهده سفارش‌ها
          </Link>
          <Button variant="outline" onClick={onClose}>بستن</Button>
        </div>
      </div>
    </div>
  );
}
