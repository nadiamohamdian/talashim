export type OrderStatus = 'pending' | 'confirmed' | 'paid' | 'cancelled';

export type PaymentStatus =
  | 'pending'
  | 'awaiting_receipt'
  | 'receipt_submitted'
  | 'authorized'
  | 'paid'
  | 'failed'
  | 'rejected';

export type CheckoutPaymentProvider = 'card_to_card' | 'gateway' | 'credit';

export interface OrderItemSummary {
  id: string;
  productId: string;
  productTitle: string;
  productSlug: string;
  quantity: number;
  unitPriceToman: number;
}

export interface OrderSummary {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus | null;
  subtotalToman: number;
  taxToman: number;
  totalToman: number;
  itemCount: number;
  createdAt: string;
}

export interface OrderDetail extends OrderSummary {
  items: OrderItemSummary[];
  payments: Array<{
    id: string;
    status: PaymentStatus;
    provider: string;
    amountToman: number;
    receiptUrl?: string | null;
    rejectionReason?: string | null;
    createdAt: string;
  }>;
}

export interface AccountSummary {
  activeOrders: number;
  totalOrders: number;
  rialBalance: string;
  goldBalanceGram: string;
  kycStatus: 'none' | 'pending' | 'approved' | 'rejected';
}
