import type { OrderDetail } from '@sadafgold/types';

export function isOrderInvoiceReady(
  order: Pick<OrderDetail, 'status' | 'paymentStatus'>,
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

export function isAdminOrderInvoiceReady(order: {
  status: string;
  paymentStatus: string | null;
  payments?: Array<{ status: string }>;
}): boolean {
  const status = order.status.toUpperCase();
  if (status === 'CANCELLED' || status === 'PENDING') {
    return false;
  }

  const paymentStatus = order.paymentStatus?.toUpperCase() ?? null;
  const hasPaidPayment = order.payments?.some((payment) => payment.status.toUpperCase() === 'PAID');

  return status === 'CONFIRMED' || status === 'PAID' || paymentStatus === 'PAID' || Boolean(hasPaidPayment);
}

export function getOrderInvoiceCustomerName(order: OrderDetail): string {
  const invoiceFirstName = order.invoiceFirstName?.trim();
  const invoiceLastName = order.invoiceLastName?.trim();
  if (invoiceFirstName && invoiceLastName) {
    return `${invoiceFirstName} ${invoiceLastName}`;
  }

  const customer = order.customer;
  if (!customer) {
    return '—';
  }

  const fromParts = [customer.firstName, customer.lastName].filter(Boolean).join(' ').trim();
  return fromParts || customer.fullName;
}
