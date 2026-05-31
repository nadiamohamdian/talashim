export const adminQueryKeys = {
  analytics: ['admin', 'analytics'] as const,
  users: (page: number, search: string, role: string) =>
    ['admin', 'users', page, search, role] as const,
  kyc: (page: number, status: string) => ['admin', 'kyc', page, status] as const,
  walletTx: (page: number, type: string) => ['admin', 'wallet-tx', page, type] as const,
  trades: (page: number, side: string) => ['admin', 'trade-tx', page, side] as const,
  wallets: (page: number, search: string) => ['admin', 'wallets', page, search] as const,
  audit: (page: number, source: string) => ['admin', 'audit', page, source] as const,
  catalog: (page: number, search: string, category: string) =>
    ['catalog', page, search, category] as const,
  catalogDetail: (slug: string) => ['catalog', 'detail', slug] as const,
  pricingLive: (symbol: string, karat: number) => ['pricing', 'live', symbol, karat] as const,
  pricingHistory: (symbol: string, karat: number) => ['pricing', 'history', symbol, karat] as const,
  blog: (page: number) => ['blog', page] as const,
};
