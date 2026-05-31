import { adminEnvSchema } from '@sadafgold/shared/admin-env';

export const adminEnv = adminEnvSchema.parse({
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_ADMIN_APP_NAME: process.env.NEXT_PUBLIC_ADMIN_APP_NAME,
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
});
