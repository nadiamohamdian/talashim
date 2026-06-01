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

export interface AdminProductDetailDto extends AdminProductDto {
  livePriceToman?: number;
  finalPriceToman?: number;
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
  totalToman: number;
  itemCount: number;
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
