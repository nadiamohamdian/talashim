export const PRICING_REDIS_KEYS = {
  latest: (symbol: string, karat: number) => `pricing:spot:${symbol}:${karat}`,
  historyMeta: (symbol: string, karat: number) => `pricing:meta:${symbol}:${karat}`,
} as const;
