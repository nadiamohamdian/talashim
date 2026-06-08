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

export function hasInvoiceRecipient(
  order: Pick<OrderSummary, 'invoiceFirstName' | 'invoiceLastName'>,
): boolean {
  return Boolean(order.invoiceFirstName?.trim() && order.invoiceLastName?.trim());
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

export function getOrderInvoiceFirstName(order: OrderDetail): string | null {
  return order.invoiceFirstName?.trim() ?? null;
}

export function getOrderInvoiceLastName(order: OrderDetail): string | null {
  return order.invoiceLastName?.trim() ?? null;
}
