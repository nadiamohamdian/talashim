export {
  apiClient,
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiPut,
  ApiClientError,
  clearAuthCookie,
  getApiErrorMessage,
  mapSession,
  refreshSession,
  requestAbortRegistry,
  serverFetch,
  syncAuthCookie,
  AUTH_COOKIE,
  type ApiAuthSession,
  type ApiRequestConfig,
  type ServerFetchOptions,
} from './client';

export { authApi, login, logout, requestOtp, verifyOtp } from './auth.api';
export type { LoginPayload, OtpRequestPayload, OtpVerifyPayload } from './auth.api';

export {
  marketApi,
  executeMarketBuy,
  executeMarketSell,
  getGoldTicker,
  getLivePrice,
  getMarketPrices,
  getPriceHistory,
  getTradeHistory,
  getWalletBalances,
  getWalletTransactions,
} from './market.api';
export type { MarketTradePayload, MarketPricesResponse } from './market.api';

export {
  productApi,
  getBestsellerProducts,
  getBestsellers,
  getBlogPostBySlug,
  getBlogPosts,
  getBySlug,
  getCatalogCategories,
  getCategories,
  getFaqPosts,
  getFeatured,
  getFeaturedProducts,
  getProductBySlug,
  getProducts,
  listProducts,
  searchProducts,
  searchProductsClient,
} from './product.api';

export {
  orderApi,
  checkout,
  getAccountSummary,
  getCart,
  getOrderById,
  listOrders,
  removeCartItem,
  upsertCartItem,
} from './order.api';
export type { CartItemResponse, CartResponse, CheckoutPayload } from './order.api';

export {
  userApi,
  createAddress,
  deleteAddress,
  getKycStatus,
  getProfile,
  listAddresses,
  submitKyc,
  updateAddress,
  updateProfile,
  listWishlist,
  addToWishlist,
  removeFromWishlist,
  submitContact,
} from './user.api';
export type { KycStatusResponse, UpdateProfilePayload, UserProfile } from './user.api';

export {
  adminApi,
  getAnalytics,
  listAuditLogs,
  listKyc,
  listTradeOrders,
  listUsers,
  listWalletTransactions,
  listWallets,
  reviewKyc,
  updateUserRole,
} from './admin.api';

export { queryKeys } from './query-keys';
export type {
  AdminUsersParams,
  MarketHistoryParams,
  MarketPriceParams,
  OrdersListParams,
  ProductListParams,
  ProductSearchParams,
} from './query-keys';

export * from './hooks';
