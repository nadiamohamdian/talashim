'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { Badge, Button, Skeleton } from '@sadafgold/ui';
import { formatPrice } from '@/shared/lib/format-price';
import { getApiErrorMessage } from '@/lib/api';
import { useOrder, useUploadPaymentReceiptMutation } from '@/lib/api';
import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  orderStatusBadgeClass,
} from '../lib/order-labels';

interface OrderDetailContentProps {
  orderId: string;
}

export function OrderDetailContent({ orderId }: OrderDetailContentProps) {
  const { data: order, isLoading, isError, refetch } = useOrder(orderId);
  const uploadReceipt = useUploadPaymentReceiptMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  if (isLoading) {
    return <Skeleton className="h-64 w-full rounded-2xl" />;
  }

  if (isError || !order) {
    return (
      <div className="card-luxury p-6 text-sm text-rose-600">
        بارگذاری سفارش ناموفق بود.{' '}
        <button type="button" className="underline" onClick={() => refetch()}>
          تلاش مجدد
        </button>
      </div>
    );
  }

  const pendingPayment = order.payments.find(
    (payment) => payment.status === 'awaiting_receipt' || payment.status === 'pending',
  );

  return (
    <div className="space-y-6">
      <div className="card-luxury flex flex-wrap items-start justify-between gap-4 p-6">
        <div>
          <p className="text-xs text-muted">شماره سفارش</p>
          <p className="mt-1 font-mono text-lg font-bold">{order.orderNumber}</p>
          <p className="mt-2 text-xs text-muted">
            {new Date(order.createdAt).toLocaleString('fa-IR')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge className={orderStatusBadgeClass(order.status)}>
            {ORDER_STATUS_LABELS[order.status] ?? order.status}
          </Badge>
          {order.paymentStatus ? (
            <Badge variant="outline">
              {PAYMENT_STATUS_LABELS[order.paymentStatus] ?? order.paymentStatus}
            </Badge>
          ) : null}
        </div>
      </div>

      <div className="card-luxury overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-nude-200 bg-nude-50/80 text-muted">
            <tr>
              <th className="px-4 py-3 text-right font-medium">محصول</th>
              <th className="px-4 py-3 text-right font-medium">تعداد</th>
              <th className="px-4 py-3 text-right font-medium">قیمت واحد</th>
              <th className="px-4 py-3 text-right font-medium">جمع</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-nude-100 last:border-0">
                <td className="px-4 py-4">
                  <Link
                    href={`/products/${item.productSlug}`}
                    className="font-semibold hover:text-gold-dark"
                  >
                    {item.productTitle}
                  </Link>
                </td>
                <td className="px-4 py-4">{item.quantity}</td>
                <td className="px-4 py-4">{formatPrice(item.unitPriceToman)} تومان</td>
                <td className="px-4 py-4 font-semibold">
                  {formatPrice(item.unitPriceToman * item.quantity)} تومان
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card-luxury space-y-2 p-6 text-sm">
        <div className="flex justify-between">
          <span className="text-muted">جمع</span>
          <span>{formatPrice(order.subtotalToman)} تومان</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">مالیات</span>
          <span>{formatPrice(order.taxToman)} تومان</span>
        </div>
        <div className="flex justify-between border-t border-nude-200 pt-3 text-base font-bold text-gold-dark">
          <span>مبلغ نهایی</span>
          <span>{formatPrice(order.totalToman)} تومان</span>
        </div>
      </div>

      {pendingPayment ? (
        <div className="card-luxury space-y-4 p-6">
          <h3 className="font-semibold">بارگذاری فیش پرداخت</h3>
          <p className="text-sm text-muted">
            پس از واریز، تصویر فیش را بارگذاری کنید تا توسط پشتیبانی تأیید شود.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) {
                return;
              }
              setUploadError(null);
              uploadReceipt.mutate(
                { orderId: order.id, paymentId: pendingPayment.id, file },
                {
                  onError: (error) => {
                    setUploadError(getApiErrorMessage(error, 'بارگذاری فیش ناموفق بود'));
                  },
                },
              );
              event.target.value = '';
            }}
          />
          <Button
            variant="outline"
            disabled={uploadReceipt.isPending}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploadReceipt.isPending ? 'در حال بارگذاری...' : 'انتخاب تصویر فیش'}
          </Button>
          {uploadError ? <p className="text-sm text-rose-600">{uploadError}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
