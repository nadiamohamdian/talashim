import { z } from 'zod';
import { sharedEnvSchema } from './shared';

export const workerEnvSchema = sharedEnvSchema.extend({
  REDIS_URL: z.string().url().default('redis://localhost:6379'),
  WORKER_NAME: z.string().min(1).default('pricing-sync'),
  WORKER_CONCURRENCY: z.coerce.number().int().positive().default(5),
});

export type WorkerEnv = z.infer<typeof workerEnvSchema>;
