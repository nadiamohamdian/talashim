import type { InventoryReportRow, InventoryReportSummary } from './reports';

export interface AdminProductInventoryDto {
  quantity: number;
  reserved: number;
  available: number;
}

export interface AdminProductDto {
  id: string;
  sku: string;
  slug: string;
  title: string;
  description: string;
  seoDescription: string;
  seoTitle?: string | null;
  seoKeywords?: string | null;
  ogImageUrl?: string | null;
  seoCanonicalPath?: string | null;
  seoNoIndex?: boolean;
  category: string;
  karat: number;
  weightGram: string;
  makingFeePercent: number;
  priceToman: number;
  imageUrl: string;
  featured: boolean;
  inventory: AdminProductInventoryDto | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminProductImageDto {
  id: string;
  url: string;
  alt: string;
  sortOrder: number;
}

export interface AdminProductVariantDto {
  id: string;
  sku: string;
  color: string | null;
  size: string | null;
  priceToman: number;
  weightGram: string | null;
  makingFeePercent: number | null;
  imageUrl: string | null;
  quantity: number;
  sortOrder: number;
  isDefault: boolean;
}

export interface AdminProductDetailDto extends AdminProductDto {
  livePriceToman?: number;
  finalPriceToman?: number;
  discountPercent: number | null;
  discountStartsAt: string | null;
  discountEndsAt: string | null;
  galleryImages: AdminProductImageDto[];
  variants: AdminProductVariantDto[];
  videos: AdminProductVideoDto[];
}

export interface AdminProductVideoDto {
  id: string;
  productId: string | null;
  productTitle: string | null;
  title: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminInventoryRowDto {
  productId: string;
  sku: string;
  title: string;
  category: string;
  quantity: number;
  reserved: number;
  available: number;
  lowStock: boolean;
  updatedAt: string;
}

export interface AdminInventoryMovementDto {
  id: string;
  productId: string;
  productTitle: string;
  productSku: string;
  type: string;
  quantityDelta: number;
  quantityBefore: number;
  quantityAfter: number;
  reservedBefore: number;
  reservedAfter: number;
  note: string | null;
  actorName: string | null;
  createdAt: string;
}

export interface AdminOrderUserDto {
  id: string;
  email: string;
  fullName: string;
}

export interface AdminOrderListItemDto {
  id: string;
  orderNumber: string;
  status: string;
  subtotalToman: number;
  taxToman: number;
  isInsured: boolean;
  insuranceFeeToman: number;
  totalToman: number;
  itemCount: number;
  paymentStatus: string | null;
  primaryPayment: {
    id: string;
    status: string;
    receiptUrl: string | null;
  } | null;
  user: AdminOrderUserDto | null;
  createdAt: string;
}

export interface AdminOrderItemDto {
  id: string;
  productId: string;
  productTitle: string;
  productSlug: string;
  productSku: string;
  quantity: number;
  unitPriceToman: number;
  lineTotalToman: number;
}

export interface AdminOrderPaymentDto {
  id: string;
  status: string;
  provider: string;
  reference: string | null;
  amountToman: number;
  receiptUrl?: string | null;
  receiptUploadedAt?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
}

export interface AdminOrderDetailDto extends AdminOrderListItemDto {
  items: AdminOrderItemDto[];
  payments: AdminOrderPaymentDto[];
  updatedAt: string;
}

export interface AdminInventoryReportResponse {
  summary: InventoryReportSummary;
  page: number;
  limit: number;
  total: number;
  items: InventoryReportRow[];
}
