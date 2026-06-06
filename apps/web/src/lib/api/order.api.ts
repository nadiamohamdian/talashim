import type { AccountSummary, OrderDetail, OrderSummary, PaginatedResponse } from '@sadafgold/types';
import type { CheckoutPaymentProvider } from '@sadafgold/types';
import { apiDelete, apiGet, apiPost, apiClient } from '@/lib/api/client';
import type { OrdersListParams } from '@/lib/api/query-keys';

export interface CartItemResponse {
  id: string;
  productId: string;
  slug: string;
  title: string;
  imageUrl: string;
  weightGram: number;
  quantity: number;
  unitPriceToman: number;
}

export interface CartResponse {
  id: string | null;
  items: CartItemResponse[];
  subtotalToman: number;
}

export interface CheckoutPayload {
  cartId: string;
  paymentProvider: CheckoutPaymentProvider;
  shippingAddressId: string;
  isInsured?: boolean;
}

export const orderApi = {
  getAccountSummary(signal?: AbortSignal): Promise<AccountSummary> {
    return apiGet<AccountSummary>('/orders/me/summary', {
      signal,
      abortKey: 'orders:summary',
    });
  },

  list(params: OrdersListParams & { status?: string } = {}, signal?: AbortSignal): Promise<PaginatedResponse<OrderSummary>> {
    return apiGet<PaginatedResponse<OrderSummary>>('/orders/me', {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
        status: params.status,
      },
      signal,
      abortKey: `orders:list:${params.page ?? 1}:${params.status ?? 'all'}`,
    });
  },

  getById(orderId: string, signal?: AbortSignal): Promise<OrderDetail> {
    return apiGet<OrderDetail>(`/orders/${orderId}`, {
      signal,
      abortKey: `orders:detail:${orderId}`,
    });
  },

  checkout(payload: CheckoutPayload): Promise<OrderDetail> {
    return apiPost<OrderDetail>('/checkout', payload);
  },

  uploadPaymentReceipt(orderId: string, paymentId: string, file: File): Promise<OrderDetail> {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient
      .post<OrderDetail>(`/orders/${orderId}/payments/${paymentId}/receipt`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(({ data }) => data);
  },

  getCart(signal?: AbortSignal): Promise<CartResponse> {
    return apiGet<CartResponse>('/cart/me', { signal });
  },

  upsertCartItem(payload: { productId: string; quantity: number }): Promise<CartResponse> {
    return apiPost<CartResponse>('/cart/items', payload);
  },

  removeCartItem(productId: string): Promise<CartResponse> {
    return apiDelete<CartResponse>(`/cart/items/${productId}`);
  },
};

export const {
  getAccountSummary,
  list: listOrders,
  getById: getOrderById,
  checkout,
  getCart,
  upsertCartItem,
  removeCartItem,
} = orderApi;
