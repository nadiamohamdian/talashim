export const SWAGGER_JWT_SCHEME = 'access-token' as const;

export const SWAGGER_TAG_DEFINITIONS: Array<{ name: string; description: string }> = [
  { name: 'meta', description: 'Service metadata and root endpoints' },
  { name: 'health', description: 'Liveness and dependency health checks' },
  { name: 'auth', description: 'Registration, login, refresh tokens, and logout' },
  { name: 'catalog', description: 'Product catalog and featured listings' },
  { name: 'inventory', description: 'Stock reservation and inventory operations' },
  { name: 'cart', description: 'Shopping cart management' },
  { name: 'checkout', description: 'Order creation and checkout flow' },
  { name: 'blog', description: 'Content and magazine articles' },
  { name: 'pricing', description: 'Live gold pricing and historical ticks' },
  { name: 'market', description: 'Cached market data — gold, currency, and ticker snapshots' },
  { name: 'wallet', description: 'Rial and gold wallet balances, deposits, transfers' },
  { name: 'trading', description: 'Market buy/sell gold execution' },
  { name: 'admin', description: 'Enterprise admin: users, KYC, monitoring, audit (ADMIN role)' },
];

export const SWAGGER_TAG_GROUPS: Array<{ name: string; tags: string[] }> = [
  {
    name: 'Platform',
    tags: ['meta', 'health', 'auth'],
  },
  {
    name: 'Commerce',
    tags: ['catalog', 'inventory', 'cart', 'checkout', 'blog'],
  },
  {
    name: 'Gold & Treasury',
    tags: ['pricing', 'market', 'wallet', 'trading'],
  },
  {
    name: 'Administration',
    tags: ['admin'],
  },
];
