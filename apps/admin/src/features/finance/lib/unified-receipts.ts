import type { AdminPaymentReceiptItem, AdminWalletTransaction } from '@talashim/types';
import { PAYMENT_STATUS_FA } from '@/features/commerce/lib/labels';
import { WALLET_TX_STATUS_FA } from './labels';

export type UnifiedReceiptSource = 'order' | 'wallet';

export interface UnifiedReceiptRow {
  key: string;
  source: UnifiedReceiptSource;
  id: string;
  receiptUrl: string;
  amountToman: number;
  status: string;
  statusLabel: string;
  uploadedAt: string | null;
  userName: string;
  referenceLabel: string;
  referenceHref?: string;
  orderId?: string;
  paymentId?: string;
  transactionId?: string;
  rejectionReason?: string | null;
  canReview: boolean;
  rawOrder?: AdminPaymentReceiptItem;
  rawWallet?: AdminWalletTransaction;
}

export const RECEIPT_SOURCE_FA: Record<UnifiedReceiptSource, string> = {
  order: 'خرید سفارش',
  wallet: 'شارژ کیف پول',
};

export function mapOrderReceipt(item: AdminPaymentReceiptItem): UnifiedReceiptRow {
  return {
    key: `order-${item.id}`,
    source: 'order',
    id: item.id,
    receiptUrl: item.receiptUrl,
    amountToman: item.amountToman,
    status: item.status,
    statusLabel: PAYMENT_STATUS_FA[item.status] ?? item.status,
    uploadedAt: item.receiptUploadedAt,
    userName: item.order.user?.fullName ?? '—',
    referenceLabel: item.order.orderNumber,
    referenceHref: `/orders/${item.orderId}`,
    orderId: item.orderId,
    paymentId: item.id,
    rejectionReason: item.rejectionReason,
    canReview: item.status === 'RECEIPT_SUBMITTED',
    rawOrder: item,
  };
}

export function mapWalletDepositReceipt(item: AdminWalletTransaction): UnifiedReceiptRow | null {
  const receiptUrl = item.depositRequest?.receiptUrl;
  if (!receiptUrl) {
    return null;
  }

  const amount = item.depositRequest?.amountToman
    ? Number(item.depositRequest.amountToman)
    : 0;

  return {
    key: `wallet-${item.id}`,
    source: 'wallet',
    id: item.id,
    receiptUrl,
    amountToman: amount,
    status: item.status,
    statusLabel: WALLET_TX_STATUS_FA[item.status] ?? item.status,
    uploadedAt: item.createdAt,
    userName: item.user?.fullName ?? '—',
    referenceLabel: item.reference,
    transactionId: item.id,
    rejectionReason: item.depositRequest?.rejectionReason ?? null,
    canReview: item.status === 'PENDING',
    rawWallet: item,
  };
}

export function mergeUnifiedReceipts(
  orders: AdminPaymentReceiptItem[],
  wallets: AdminWalletTransaction[],
  sourceFilter: '' | UnifiedReceiptSource,
): UnifiedReceiptRow[] {
  const orderRows = orders.map(mapOrderReceipt);
  const walletRows = wallets
    .map(mapWalletDepositReceipt)
    .filter((row): row is UnifiedReceiptRow => row !== null);

  const merged = [...orderRows, ...walletRows].sort((a, b) => {
    const aTime = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0;
    const bTime = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0;
    return bTime - aTime;
  });

  if (!sourceFilter) {
    return merged;
  }

  return merged.filter((row) => row.source === sourceFilter);
}
