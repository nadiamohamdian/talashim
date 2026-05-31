import { z } from 'zod';
import { sharedEnvSchema } from './shared';

export const adminEnvSchema = sharedEnvSchema.pick({
  NEXT_PUBLIC_APP_NAME: true,
  NEXT_PUBLIC_API_BASE_URL: true,
}).extend({
  NEXT_PUBLIC_ADMIN_APP_NAME: z.string().min(1).default('Sadaf Gold Admin'),
});

export type AdminEnv = z.infer<typeof adminEnvSchema>;
