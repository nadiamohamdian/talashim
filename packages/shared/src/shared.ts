import { z } from 'zod';

export const sharedEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXT_PUBLIC_APP_NAME: z.string().min(1).default('Sadaf Gold'),
  NEXT_PUBLIC_API_BASE_URL: z.string().url().default('http://localhost:4000/api/v1'),
});

export type SharedEnv = z.infer<typeof sharedEnvSchema>;
