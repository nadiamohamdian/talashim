import type { OrderDetail, OrderSummary } from '@sadafgold/types';

export function isOrderInvoiceReady(
  order: Pick<OrderSummary, 'status' | 'paymentStatus'>,
): boolean {
  if (order.status === 'cancelled' || order.status === 'pending') {
    return false;
  }

  return (
    order.status === 'confirmed' ||
    order.status === 'paid' ||
    order.paymentStatus === 'paid'
  );
}

export function getOrderInvoiceCustomerName(order: OrderDetail): string {
  const customer = order.customer;
  if (!customer) {
    return '—';
  }

  const fromParts = [customer.firstName, customer.lastName].filter(Boolean).join(' ').trim();
  return fromParts || customer.fullName;
}
