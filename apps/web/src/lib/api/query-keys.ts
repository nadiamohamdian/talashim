import type { TradeSide } from '@sadafgold/types';

export interface ProductListParams {
  limit?: number;
  category?: string;
  sale?: boolean;
}

export interface ProductSearchParams {
  query: string;
  page?: number;
  limit?: number;
  category?: string;
}

export interface MarketPriceParams {
  symbol?: string;
  karat?: number;
}

export interface MarketHistoryParams extends MarketPriceParams {
  limit?: number;
}

export interface OrdersListParams {
  page?: number;
  limit?: number;
  status?: string;
}

export interface AdminUsersParams {
  page?: number;
  search?: string;
  role?: string;
}

export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    session: () => [...queryKeys.auth.all, 'session'] as const,
  },

  products: {
    all: ['products'] as const,
    lists: () => [...queryKeys.products.all, 'list'] as const,
    list: (params: ProductListParams = {}) =>
      [...queryKeys.products.lists(), params] as const,
    featured: () => [...queryKeys.products.all, 'featured'] as const,
    bestsellers: () => [...queryKeys.products.all, 'bestsellers'] as const,
    categories: () => [...queryKeys.products.all, 'categories'] as const,
    detail: (slug: string) => [...queryKeys.products.all, 'detail', slug] as const,
    search: (params: ProductSearchParams) =>
      [...queryKeys.products.all, 'search', params] as const,
  },

  blog: {
    all: ['blog'] as const,
    list: () => [...queryKeys.blog.all, 'list'] as const,
    faq: () => [...queryKeys.blog.all, 'faq'] as const,
    detail: (slug: string) => [...queryKeys.blog.all, 'detail', slug] as const,
  },

  market: {
    all: ['market'] as const,
    prices: (params: MarketPriceParams = {}) =>
      [...queryKeys.market.all, 'prices', params] as const,
    live: (params: MarketPriceParams = {}) =>
      [...queryKeys.market.all, 'live', params] as const,
    history: (params: MarketHistoryParams = {}) =>
      [...queryKeys.market.all, 'history', params] as const,
    ticker: () => [...queryKeys.market.all, 'ticker'] as const,
    snapshot: () => [...queryKeys.market.all, 'snapshot'] as const,
  },

  orders: {
    all: ['orders'] as const,
    lists: () => [...queryKeys.orders.all, 'list'] as const,
    list: (params: OrdersListParams = {}) =>
      [...queryKeys.orders.lists(), params] as const,
    detail: (orderId: string) => [...queryKeys.orders.all, 'detail', orderId] as const,
  },

  user: {
    all: ['user'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const,
    dashboard: () => [...queryKeys.user.all, 'dashboard'] as const,
    kyc: () => [...queryKeys.user.all, 'kyc'] as const,
    addresses: () => [...queryKeys.user.all, 'addresses'] as const,
    wishlist: () => [...queryKeys.user.all, 'wishlist'] as const,
  },

  cart: {
    all: ['cart'] as const,
    me: () => [...queryKeys.cart.all, 'me'] as const,
  },

  wallet: {
    all: ['wallet'] as const,
    balances: (userId: string) => [...queryKeys.wallet.all, 'balances', userId] as const,
    transactions: (userId: string, page: number) =>
      [...queryKeys.wallet.all, 'transactions', userId, page] as const,
  },

  trading: {
    all: ['trading'] as const,
    orders: (userId: string, params?: { page?: number; side?: TradeSide }) =>
      [...queryKeys.trading.all, 'orders', userId, params ?? {}] as const,
  },

  admin: {
    all: ['admin'] as const,
    analytics: () => [...queryKeys.admin.all, 'analytics'] as const,
    users: (params: AdminUsersParams = {}) =>
      [...queryKeys.admin.all, 'users', params] as const,
    kyc: (params: { page?: number; status?: string } = {}) =>
      [...queryKeys.admin.all, 'kyc', params] as const,
    wallets: (params: { page?: number; search?: string } = {}) =>
      [...queryKeys.admin.all, 'wallets', params] as const,
    audit: (params: { page?: number; source?: string } = {}) =>
      [...queryKeys.admin.all, 'audit', params] as const,
  },
} as const;
