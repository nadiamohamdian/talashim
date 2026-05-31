import { z } from 'zod';
import { sharedEnvSchema } from './shared';

export const webEnvSchema = sharedEnvSchema.pick({
  NEXT_PUBLIC_APP_NAME: true,
  NEXT_PUBLIC_API_BASE_URL: true,
}).extend({
  NEXT_PUBLIC_WS_BASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_GOLD_TRADE_COMMISSION_PERCENT: z.coerce.number().min(0).max(100).default(0.5),
});
