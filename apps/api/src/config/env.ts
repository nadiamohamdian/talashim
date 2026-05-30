import { apiEnvSchema, type ApiEnv } from '@gold/shared/api-env';

export function validateApiEnv(config: Record<string, unknown>) {
  return apiEnvSchema.parse(config);
}

export function getApiEnv(): ApiEnv {
  return apiEnvSchema.parse(process.env);
}
