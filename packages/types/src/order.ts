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
  productSku?: string;
  quantity: number;
  unitPriceToman: number;
  weightGram?: number;
  karat?: number;
  makingFeePercent?: number;
  liveGoldPricePerGramToman?: number;
  liveGoldPrice18PerGramToman?: number;
  metalValueToman?: number;
  wageToman?: number;
  lineSubtotalToman?: number;
  lineTaxToman?: number;
  lineTotalToman?: number;
  totalWeightGram?: number;
  totalMetalValueToman?: number;
  totalWageToman?: number;
  totalLineTaxToman?: number;
}

export interface OrderShippingAddress {
  id: string;
  title: string;
  recipient: string;
  phone: string;
  line1: string;
  city: string;
  state: string;
  postalCode: string;
}

export interface OrderCustomerInfo {
  email: string;
  fullName: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  nationalId?: string | null;
}

export interface OrderSummary {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus | null;
  subtotalToman: number;
  taxToman: number;
  isInsured: boolean;
  insuranceFeeToman: number;
  totalToman: number;
  itemCount: number;
  createdAt: string;
}

export interface OrderDetail extends OrderSummary {
  items: OrderItemSummary[];
  taxPercent?: number | null;
  liveGoldPrice18PerGramToman?: number | null;
  totalGoldWeightGram?: number;
  totalMetalValueToman?: number;
  totalWageToman?: number;
  shippingAddress?: OrderShippingAddress | null;
  customer?: OrderCustomerInfo | null;
  invoicePaidAt?: string | null;
  payments: Array<{
    id: string;
    status: PaymentStatus;
    provider: string;
    amountToman: number;
    receiptUrl?: string | null;
    rejectionReason?: string | null;
    reviewedAt?: string | null;
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
