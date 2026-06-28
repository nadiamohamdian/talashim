import { axiosClient } from '@/shared/api/axios-client';
import type {
  AdminInventoryMovementDto,
  AdminInventoryReportResponse,
  AdminInventoryRowDto,
  AdminOrderDetailDto,
  AdminOrderListItemDto,
  AdminProductDetailDto,
  AdminProductDto,
  AdminProductVideoDto,
  AdminProductReviewItem,
  AdminProductReviewsGroupedResponse,
  OrderDetail,
  PaginatedResponse,
} from '@sadafgold/types';

export function fetchAdminProducts(params?: {
  page?: number;
  search?: string;
  category?: string;
  featured?: boolean;
  lowStock?: boolean;
  demoOnly?: boolean;
}) {
  return axiosClient
    .get<PaginatedResponse<AdminProductDto>>('/admin/products', { params })
    .then((r) => r.data);
}

export function fetchAdminProduct(id: string) {
  return axiosClient.get<AdminProductDetailDto>(`/admin/products/${id}`).then((r) => r.data);
}

export function fetchAdminProductBySlug(slug: string) {
  return axiosClient
    .get<AdminProductDetailDto>(`/admin/products/by-slug/${slug}`)
    .then((r) => r.data);
}

export function createAdminProduct(body: Record<string, unknown>) {
  return axiosClient.post<AdminProductDto>('/admin/products', body).then((r) => r.data);
}

export function updateAdminProduct(id: string, body: Record<string, unknown>) {
  return axiosClient.patch<AdminProductDto>(`/admin/products/${id}`, body).then((r) => r.data);
}

export function deleteAdminProduct(id: string) {
  return axiosClient.delete(`/admin/products/${id}`).then((r) => r.data);
}

export function syncCatalogDemoProducts() {
  return axiosClient
    .post<{ synced: number; slugs: string[] }>('/admin/products/sync-demo-catalog')
    .then((r) => r.data);
}

export function fetchProductVideos(params?: {
  page?: number;
  search?: string;
  productId?: string;
}) {
  return axiosClient
    .get<PaginatedResponse<AdminProductVideoDto>>('/admin/products/videos', { params })
    .then((r) => r.data);
}

export function fetchProductReviews(params?: {
  page?: number;
  status?: string;
  search?: string;
  groupByProduct?: boolean;
}) {
  const { groupByProduct, ...rest } = params ?? {};

  return axiosClient
    .get<PaginatedResponse<AdminProductReviewItem> | AdminProductReviewsGroupedResponse>(
      '/admin/product-reviews',
      {
        params: {
          ...rest,
          ...(groupByProduct ? { groupByProduct: true } : {}),
        },
      },
    )
    .then((r) => r.data);
}

export function reviewProductReview(
  id: string,
  payload: { status: 'APPROVED' | 'REJECTED' },
) {
  return axiosClient
    .patch<AdminProductReviewItem>(`/admin/product-reviews/${id}/review`, payload)
    .then((r) => r.data);
}

export function createAdminProductReview(body: {
  productSlug: string;
  body: string;
  rating: number;
  authorName?: string;
  phone?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}) {
  return axiosClient
    .post<AdminProductReviewItem>('/admin/product-reviews', body)
    .then((r) => r.data);
}

export function updateAdminProductReview(
  id: string,
  body: {
    body?: string;
    rating?: number;
    authorName?: string;
    status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  },
) {
  return axiosClient
    .patch<AdminProductReviewItem>(`/admin/product-reviews/${id}`, body)
    .then((r) => r.data);
}

export function deleteAdminProductReview(id: string) {
  return axiosClient.delete(`/admin/product-reviews/${id}`).then((r) => r.data);
}

export function createProductVideo(body: Record<string, unknown>) {
  return axiosClient
    .post<AdminProductVideoDto>('/admin/products/videos', body)
    .then((r) => r.data);
}

export function updateProductVideo(id: string, body: Record<string, unknown>) {
  return axiosClient
    .patch<AdminProductVideoDto>(`/admin/products/videos/${id}`, body)
    .then((r) => r.data);
}

export function deleteProductVideo(id: string) {
  return axiosClient.delete(`/admin/products/videos/${id}`).then((r) => r.data);
}

export function fetchInventoryStock(params?: {
  page?: number;
  search?: string;
  category?: string;
  lowStockOnly?: boolean;
}) {
  return axiosClient
    .get<PaginatedResponse<AdminInventoryRowDto>>('/admin/inventory', { params })
    .then((r) => r.data);
}

export function fetchInventoryHistory(params?: {
  page?: number;
  productId?: string;
  type?: string;
}) {
  return axiosClient
    .get<PaginatedResponse<AdminInventoryMovementDto>>('/admin/inventory/history', { params })
    .then((r) => r.data);
}

export function adjustInventory(body: {
  productId: string;
  quantityDelta: number;
  note?: string;
}) {
  return axiosClient.post('/admin/inventory/adjustments', body).then((r) => r.data);
}

export function fetchInventorySectionReport(params?: {
  page?: number;
  search?: string;
  category?: string;
  lowStockOnly?: boolean;
}) {
  return axiosClient
    .get<AdminInventoryReportResponse>('/admin/inventory/reports', { params })
    .then((r) => r.data);
}

export function fetchAdminOrders(params?: {
  page?: number;
  search?: string;
  status?: string;
  from?: string;
  to?: string;
}) {
  return axiosClient
    .get<PaginatedResponse<AdminOrderListItemDto>>('/admin/orders', { params })
    .then((r) => r.data);
}

export function fetchAdminOrder(id: string) {
  return axiosClient.get<AdminOrderDetailDto>(`/admin/orders/${id}`).then((r) => r.data);
}

export function fetchAdminOrderInvoice(id: string) {
  return axiosClient.get<OrderDetail>(`/admin/orders/${id}/invoice`).then((r) => r.data);
}

export function updateAdminOrderStatus(id: string, status: string) {
  return axiosClient
    .patch<AdminOrderDetailDto>(`/admin/orders/${id}/status`, { status })
    .then((r) => r.data);
}

export function approveAdminPaymentReceipt(orderId: string, paymentId: string) {
  return axiosClient
    .post<AdminOrderDetailDto>(`/admin/orders/${orderId}/payments/${paymentId}/approve-receipt`)
    .then((r) => r.data);
}

export function rejectAdminPaymentReceipt(orderId: string, paymentId: string, reason: string) {
  return axiosClient
    .post<AdminOrderDetailDto>(`/admin/orders/${orderId}/payments/${paymentId}/reject-receipt`, {
      reason,
    })
    .then((r) => r.data);
}
