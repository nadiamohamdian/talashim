export const adminQueryKeys = {
  analytics: ['admin', 'analytics'] as const,
  users: (page: number, search: string, role: string) =>
    ['admin', 'users', page, search, role] as const,
  userDetail: (userId: string) => ['admin', 'users', 'detail', userId] as const,
  userActivity: (userId: string, page: number) =>
    ['admin', 'users', 'activity', userId, page] as const,
  tickets: {
    list: (page: number, status: string, priority: string, scope: string, search: string) =>
      ['admin', 'tickets', page, status, priority, scope, search] as const,
    detail: (ticketId: string) => ['admin', 'tickets', 'detail', ticketId] as const,
  },
  kyc: (page: number, status: string) => ['admin', 'kyc', page, status] as const,
  walletTx: (page: number, type: string) => ['admin', 'wallet-tx', page, type] as const,
  walletDepositReceipts: (page: number, status: string) =>
    ['admin', 'wallet-deposit-receipts', page, status] as const,
  walletWithdrawalRequests: (page: number, status: string) =>
    ['admin', 'wallet-withdrawal-requests', page, status] as const,
  paymentReceipts: (page: number, status: string) =>
    ['admin', 'payment-receipts', page, status] as const,
  trades: (page: number, side: string) => ['admin', 'trade-tx', page, side] as const,
  wallets: (page: number, search: string) => ['admin', 'wallets', page, search] as const,
  audit: (page: number, source: string) => ['admin', 'audit', page, source] as const,
  sessions: (page: number, search: string, status: string) =>
    ['admin', 'sessions', page, search, status] as const,
  loginHistory: (page: number, search: string, action: string) =>
    ['admin', 'login-history', page, search, action] as const,
  permissions: ['admin', 'permissions'] as const,
  staffUsers: (page: number, search: string) => ['admin', 'staff-users', page, search] as const,
  reports: {
    sales: (page: number, from: string, to: string, status: string) =>
      ['admin', 'reports', 'sales', page, from, to, status] as const,
    inventory: (page: number, search: string, category: string, lowStock: boolean) =>
      ['admin', 'reports', 'inventory', page, search, category, lowStock] as const,
    users: (page: number, from: string, to: string, search: string, role: string) =>
      ['admin', 'reports', 'users', page, from, to, search, role] as const,
    trading: (page: number, from: string, to: string, side: string, status: string) =>
      ['admin', 'reports', 'trading', page, from, to, side, status] as const,
    financial: (page: number, from: string, to: string, type: string) =>
      ['admin', 'reports', 'financial', page, from, to, type] as const,
  },
  pricing: {
    live: (symbol: string, karat: number) => ['admin', 'pricing', 'live', symbol, karat] as const,
    history: (symbol: string, karat: number, from: string, to: string) =>
      ['admin', 'pricing', 'history', symbol, karat, from, to] as const,
    providers: ['admin', 'pricing', 'providers'] as const,
    margins: ['admin', 'pricing', 'margins'] as const,
    overrides: (page: number) => ['admin', 'pricing', 'overrides', page] as const,
  },
  finance: {
    ledger: (page: number, search: string, assetType: string, side: string) =>
      ['admin', 'finance', 'ledger', page, search, assetType, side] as const,
    accounting: (search: string, category: string) =>
      ['admin', 'finance', 'accounting', search, category] as const,
    reports: (page: number, from: string, to: string, type: string) =>
      ['admin', 'finance', 'reports', page, from, to, type] as const,
  },
  notifications: {
    inbox: (page: number, unreadOnly: boolean, channel: string) =>
      ['admin', 'notifications', 'inbox', page, unreadOnly, channel] as const,
    templates: (page: number, search: string) =>
      ['admin', 'notifications', 'templates', page, search] as const,
    rules: (page: number, search: string) =>
      ['admin', 'notifications', 'rules', page, search] as const,
    delivery: (page: number, status: string, channel: string, search: string) =>
      ['admin', 'notifications', 'delivery', page, status, channel, search] as const,
  },
  commerce: {
    products: (page: number, search: string, category: string, lowStock: boolean, demoOnly: boolean) =>
      ['admin', 'commerce', 'products', page, search, category, lowStock, demoOnly] as const,
    videos: (page: number, search: string) =>
      ['admin', 'commerce', 'videos', page, search] as const,
    reviews: (page: number, status: string, search: string) =>
      ['admin', 'commerce', 'reviews', page, status, search] as const,
    inventory: (page: number, search: string, category: string, lowStock: boolean) =>
      ['admin', 'commerce', 'inventory', page, search, category, lowStock] as const,
    inventoryHistory: (page: number, productId: string, type: string) =>
      ['admin', 'commerce', 'inventory-history', page, productId, type] as const,
    inventoryReports: (page: number, search: string, category: string, lowStock: boolean) =>
      ['admin', 'commerce', 'inventory-reports', page, search, category, lowStock] as const,
    orders: (page: number, search: string, status: string, from: string, to: string) =>
      ['admin', 'commerce', 'orders', page, search, status, from, to] as const,
  },
  trading: {
    orders: (page: number, side: string, status: string, search: string, from: string, to: string) =>
      ['admin', 'trading', 'orders', page, side, status, search, from, to] as const,
    settlementSummary: ['admin', 'trading', 'settlement', 'summary'] as const,
    settlementQueue: (page: number, status: string, search: string) =>
      ['admin', 'trading', 'settlement', 'queue', page, status, search] as const,
    reports: (page: number, from: string, to: string, side: string, status: string) =>
      ['admin', 'trading', 'reports', page, from, to, side, status] as const,
  },
  cms: {
    blogCategories: ['admin', 'cms', 'blog', 'categories'] as const,
    blog: (page: number, search: string, published: string) =>
      ['admin', 'cms', 'blog', page, search, published] as const,
    faq: (page: number, search: string) => ['admin', 'cms', 'faq', page, search] as const,
    homepage: ['admin', 'cms', 'homepage'] as const,
    banners: (page: number, status: string, placement = '') =>
      ['admin', 'cms', 'banners', page, status, placement] as const,
    lensVideos: (page: number, status: string) =>
      ['admin', 'cms', 'lens-videos', page, status] as const,
    pages: (page: number, search: string) => ['admin', 'cms', 'pages', page, search] as const,
    seo: ['admin', 'cms', 'seo'] as const,
    media: (page: number, search: string, folder: string) =>
      ['admin', 'cms', 'media', page, search, folder] as const,
  },
};
