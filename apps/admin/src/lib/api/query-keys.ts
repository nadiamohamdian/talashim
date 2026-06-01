export const adminQueryKeys = {
  analytics: ['admin', 'analytics'] as const,
  users: (page: number, search: string, role: string) =>
    ['admin', 'users', page, search, role] as const,
  kyc: (page: number, status: string) => ['admin', 'kyc', page, status] as const,
  walletTx: (page: number, type: string) => ['admin', 'wallet-tx', page, type] as const,
  trades: (page: number, side: string) => ['admin', 'trade-tx', page, side] as const,
  wallets: (page: number, search: string) => ['admin', 'wallets', page, search] as const,
  audit: (page: number, source: string) => ['admin', 'audit', page, source] as const,
  loginHistory: (page: number, search: string, action: string) =>
    ['admin', 'login-history', page, search, action] as const,
  sessions: (page: number, search: string, status: string) =>
    ['admin', 'sessions', page, search, status] as const,
  staffUsers: (page: number, search: string) => ['admin', 'staff-users', page, search] as const,
  permissions: ['admin', 'permissions'] as const,
  catalog: (page: number, search: string, category: string) =>
    ['catalog', page, search, category] as const,
  catalogDetail: (slug: string) => ['catalog', 'detail', slug] as const,
  pricingLive: (symbol: string, karat: number) => ['pricing', 'live', symbol, karat] as const,
  pricingHistory: (symbol: string, karat: number) => ['pricing', 'history', symbol, karat] as const,
  blog: (page: number) => ['blog', page] as const,
  trading: {
    orders: (
      page: number,
      side: string,
      status: string,
      search: string,
      from: string,
      to: string,
    ) => ['trading', 'orders', page, side, status, search, from, to] as const,
    settlementSummary: ['trading', 'settlement-summary'] as const,
    settlementQueue: (page: number, status: string, search: string) =>
      ['trading', 'settlement-queue', page, status, search] as const,
    reports: (page: number, from: string, to: string, side: string, status: string) =>
      ['trading', 'reports', page, from, to, side, status] as const,
  },
  commerce: {
    products: (page: number, search: string, category: string, lowStock: boolean) =>
      ['commerce', 'products', page, search, category, lowStock] as const,
    videos: (page: number, search: string) => ['commerce', 'videos', page, search] as const,
    inventory: (page: number, search: string, category: string, lowStockOnly: boolean) =>
      ['commerce', 'inventory', page, search, category, lowStockOnly] as const,
    inventoryHistory: (page: number, productId: string, type: string) =>
      ['commerce', 'inventory-history', page, productId, type] as const,
    inventoryReports: (page: number, search: string, category: string, lowStockOnly: boolean) =>
      ['commerce', 'inventory-reports', page, search, category, lowStockOnly] as const,
    orders: (page: number, search: string, status: string, from: string, to: string) =>
      ['commerce', 'orders', page, search, status, from, to] as const,
  },
  finance: {
    ledger: (page: number, search: string, assetType: string, side: string) =>
      ['finance', 'ledger', page, search, assetType, side] as const,
    accounting: (search: string, category: string) =>
      ['finance', 'accounting', search, category] as const,
    reports: (page: number, from: string, to: string, type: string) =>
      ['finance', 'reports', page, from, to, type] as const,
  },
  pricing: {
    providers: ['pricing', 'providers'] as const,
    history: (symbol: string, karat: number, from: string, to: string) =>
      ['pricing', 'history-admin', symbol, karat, from, to] as const,
    margins: ['pricing', 'margins'] as const,
    overrides: (page: number) => ['pricing', 'overrides', page] as const,
  },
  reports: {
    sales: (page: number, from: string, to: string, status: string) =>
      ['reports', 'sales', page, from, to, status] as const,
    trading: (page: number, from: string, to: string, side: string, status: string) =>
      ['reports', 'trading', page, from, to, side, status] as const,
    inventory: (page: number, search: string, category: string, lowStockOnly: boolean) =>
      ['reports', 'inventory', page, search, category, lowStockOnly] as const,
    financial: (page: number, from: string, to: string, type: string) =>
      ['reports', 'financial', page, from, to, type] as const,
    users: (page: number, from: string, to: string, search: string, role: string) =>
      ['reports', 'users', page, from, to, search, role] as const,
  },
  cms: {
    seo: ['cms', 'seo'] as const,
    homepage: ['cms', 'homepage'] as const,
    blogCategories: ['cms', 'blog-categories'] as const,
    blog: (page: number, search: string, published: string) =>
      ['cms', 'blog', page, search, published] as const,
    faq: (page: number, search: string) => ['cms', 'faq', page, search] as const,
    banners: (page: number, status: string) => ['cms', 'banners', page, status] as const,
    pages: (page: number, search: string) => ['cms', 'pages', page, search] as const,
    media: (page: number, search: string, folder: string) =>
      ['cms', 'media', page, search, folder] as const,
  },
  notifications: {
    inbox: (page: number, unreadOnly: boolean, channel: string) =>
      ['notifications', 'inbox', page, unreadOnly, channel] as const,
    templates: (page: number, search: string) =>
      ['notifications', 'templates', page, search] as const,
    rules: (page: number, search: string) => ['notifications', 'rules', page, search] as const,
    delivery: (page: number, status: string, channel: string, search: string) =>
      ['notifications', 'delivery', page, status, channel, search] as const,
  },
};
