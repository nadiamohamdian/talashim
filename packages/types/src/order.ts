export type OrderStatus = 'pending' | 'confirmed' | 'paid' | 'cancelled';

export type PaymentStatus = 'pending' | 'authorized' | 'paid' | 'failed';

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
