import { z } from 'zod';
import { sharedEnvSchema } from './shared';

/** Nest URI versioning adds a `v` prefix — use `1` in env, not `v1` (avoids `/api/vv1`). */
export function normalizeApiVersionSegment(version: string): string {
  return version.startsWith('v') ? version.slice(1) : version;
}

/** Public path segment, e.g. `v1`. */
export function apiVersionUri(version: string): string {
  return `v${normalizeApiVersionSegment(version)}`;
}

export const apiEnvSchema = sharedEnvSchema.extend({
  API_PORT: z.coerce.number().int().positive().default(4000),
  API_PREFIX: z.string().min(1).default('api'),
  API_VERSION: z
    .string()
    .min(1)
    .default('1')
    .transform(normalizeApiVersionSegment),
  WEB_URL: z.string().url().default('http://localhost:3000'),
  ADMIN_URL: z.string().url().default('http://localhost:3002'),
  CORS_ORIGIN: z.string().url().default('http://localhost:3000'),
  COOKIE_DOMAIN: z.string().min(1).default('localhost'),
  DATABASE_URL: z.string().min(1),
  DIRECT_DATABASE_URL: z.string().min(1).optional(),
  REDIS_URL: z.string().url().default('redis://localhost:6379'),
  BRS_API_KEY: z.string().min(1).optional(),
  BRS_API_URL: z.string().url().default('https://api.brsapi.ir/Market/Gold_Currency.php'),
  /** Optional base host; full endpoint is derived when BRS_API_URL is unset. */
  BRS_BASE_URL: z.string().url().optional(),
  BRS_REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(8_000),
  BRS_MAX_RETRIES: z.coerce.number().int().min(0).max(5).default(2),
  MARKET_SYNC_INTERVAL_MS: z.coerce.number().int().positive().default(30_000),
  /** Hot cache TTL — served as fresh market data. */
  MARKET_CACHE_TTL_SECONDS: z.coerce.number().int().positive().default(45),
  /** Max age to serve stale cache when the provider fails. */
  MARKET_CACHE_STALE_SECONDS: z.coerce.number().int().positive().default(300),
  MARKET_GOLD_CACHE_TTL_SECONDS: z.coerce.number().int().positive().optional(),
  MARKET_CURRENCY_CACHE_TTL_SECONDS: z.coerce.number().int().positive().optional(),
  /** Distributed sync lock TTL (should be < MARKET_SYNC_INTERVAL_MS). */
  MARKET_SYNC_LOCK_TTL_SECONDS: z.coerce.number().int().positive().default(25),
  GOLD_PRICE_PRIMARY_URL: z.string().url().optional(),
  GOLD_PRICE_REFRESH_MS: z.coerce.number().int().positive().default(30_000),
  GOLD_PRICE_CACHE_TTL_SECONDS: z.coerce.number().int().positive().default(60),
  GOLD_SPREAD_PERCENT: z.coerce.number().positive().default(1.5),
  GOLD_TRADE_COMMISSION_PERCENT: z.coerce.number().min(0).max(100).default(0.5),
  GOLD_TRADE_MIN_GRAM: z.coerce.number().positive().default(0.01),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_TTL: z.string().min(2).default('15m'),
  JWT_REFRESH_TTL: z.string().min(2).default('7d'),
  THROTTLE_TTL_MS: z.coerce.number().int().positive().default(60_000),
  THROTTLE_LIMIT: z.coerce.number().int().positive().default(120),
  THROTTLE_AUTH_LIMIT: z.coerce.number().int().positive().default(10),
  THROTTLE_AUTH_TTL_MS: z.coerce.number().int().positive().default(300_000),
  HTTP_CACHE_TTL_SECONDS: z.coerce.number().int().positive().default(60),
  COMPRESSION_ENABLED: z.coerce.boolean().default(true),
  CORS_ORIGINS: z.string().min(1).default('http://localhost:3000,http://localhost:3002'),
  TRUST_PROXY: z.coerce.boolean().default(false),
  LOG_LEVEL: z.enum(['log', 'error', 'warn', 'debug', 'verbose']).default('log'),
  /** Directory for uploaded media (relative to API process cwd). */
  UPLOAD_DIR: z.string().min(1).default('uploads'),
  /** Public origin for uploaded files, e.g. http://localhost:4000 */
  UPLOAD_PUBLIC_BASE_URL: z.string().url().default('http://localhost:4000'),
  UPLOAD_MAX_BYTES: z.coerce.number().int().positive().default(5_242_880),
});

export type ApiEnv = z.infer<typeof apiEnvSchema>;
