"use client";

import { Button, Card } from "@gold/ui";
import { useCartStore } from "../model/cart-store";
import { formatPrice } from "@/shared/lib/format-price";

export function CartDrawer() {
  const { items, total } = useCartStore();

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
      <Button className="mt-4 w-full" variant="secondary">
        ادامه فرایند سفارش
      </Button>
    </Card>
  );
}
