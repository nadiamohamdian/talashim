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
  PaginatedResponse,
} from '@talashim/types';

export function fetchAdminProducts(params?: {
  page?: number;
  search?: string;
  category?: string;
  featured?: boolean;
  lowStock?: boolean;
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

export function fetchProductVideos(params?: {
  page?: number;
  search?: string;
  productId?: string;
}) {
  return axiosClient
    .get<PaginatedResponse<AdminProductVideoDto>>('/admin/products/videos', { params })
    .then((r) => r.data);
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
