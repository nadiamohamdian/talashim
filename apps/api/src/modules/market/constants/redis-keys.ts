export const MARKET_REDIS_KEYS = {
  snapshot: 'market:prices:snapshot',
  gold: 'market:prices:gold',
  currency: 'market:prices:currency',
  meta: 'market:cache:meta',
  syncLock: 'market:sync:lock',
  all: [
    'market:prices:snapshot',
    'market:prices:gold',
    'market:prices:currency',
    'market:cache:meta',
  ],
} as const;
