import type { ApiEnv } from '@sadafgold/shared/api-env';
import { getApiEnv } from '@/config/env';

export function buildThrottlerOptions(env: ApiEnv) {
  const devMultiplier = env.NODE_ENV === 'development' ? 10 : 1;

  return [
    {
      name: 'default',
      ttl: env.THROTTLE_TTL_MS,
      limit: env.THROTTLE_LIMIT * devMultiplier,
    },
    {
      name: 'auth',
      ttl: env.THROTTLE_AUTH_TTL_MS,
      limit: env.THROTTLE_AUTH_LIMIT * devMultiplier,
    },
  ];
}

export function getAuthThrottleConfig() {
  const env = getApiEnv();
  return {
    auth: {
      limit: env.THROTTLE_AUTH_LIMIT,
      ttl: env.THROTTLE_AUTH_TTL_MS,
    },
  };
}
