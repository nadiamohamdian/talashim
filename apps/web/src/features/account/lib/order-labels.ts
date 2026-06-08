import type { OrderStatus, PaymentStatus } from '@sadafgold/types';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'در انتظار تأیید',
  confirmed: 'تأیید شده',
  paid: 'پرداخت شده',
  cancelled: 'لغو شده',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: 'در انتظار پرداخت',
  awaiting_receipt: 'در انتظار فیش',
  receipt_submitted: 'فیش ارسال شد — در انتظار بررسی',
  authorized: 'پرداخت اعتباری',
  paid: 'پرداخت تأیید شد',
  failed: 'ناموفق',
  rejected: 'فیش رد شده',
};

export function getDisplayPaymentStatus(
  order: Pick<{ status: OrderStatus; paymentStatus: PaymentStatus | null }, 'status' | 'paymentStatus'>,
): PaymentStatus | null {
  if (order.status === 'confirmed' || order.status === 'paid') {
    return 'paid';
  }

  return order.paymentStatus;
}

export function getDisplayPaymentStatusLabel(
  order: Pick<{ status: OrderStatus; paymentStatus: PaymentStatus | null }, 'status' | 'paymentStatus'>,
): string {
  const status = getDisplayPaymentStatus(order);
  if (!status) {
    return '—';
  }

  return PAYMENT_STATUS_LABELS[status] ?? status;
}

export const ORDER_STATUS_HINTS: Record<OrderStatus, string> = {
  pending: 'سفارش ثبت شده و در انتظار تأیید پشتیبانی است.',
  confirmed: 'سفارش تأیید شده و در حال آماده‌سازی است.',
  paid: 'پرداخت کامل شده است.',
  cancelled: 'این سفارش لغو شده است.',
};

export function orderStatusBadgeClass(status: OrderStatus): string {
  switch (status) {
    case 'confirmed':
      return 'bg-blue-50 text-blue-800';
    case 'paid':
      return 'bg-emerald-50 text-emerald-800';
    case 'cancelled':
      return 'bg-stone-100 text-stone-600';
    default:
      return 'bg-amber-50 text-amber-900';
  }
}

export function paymentStatusBadgeClass(status: PaymentStatus): string {
  switch (status) {
    case 'paid':
      return 'bg-emerald-50 text-emerald-800';
    case 'receipt_submitted':
      return 'bg-violet-50 text-violet-800';
    case 'awaiting_receipt':
      return 'bg-amber-50 text-amber-900';
    case 'rejected':
    case 'failed':
      return 'bg-rose-50 text-rose-800';
    case 'authorized':
      return 'bg-blue-50 text-blue-800';
    default:
      return 'bg-stone-100 text-stone-700';
  }
}
