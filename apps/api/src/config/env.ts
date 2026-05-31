import { apiEnvSchema, type ApiEnv } from '@sadafgold/shared/api-env';

export type { ApiEnv };

export function validateApiEnv(config: Record<string, unknown>) {
  return apiEnvSchema.parse(config);
}

export function getApiEnv(): ApiEnv {
  return apiEnvSchema.parse(process.env);
}
