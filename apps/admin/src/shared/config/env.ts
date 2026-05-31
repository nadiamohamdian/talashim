import { adminEnvSchema } from '@sadafgold/shared/admin-env';

export const adminEnv = adminEnvSchema.parse({
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_ADMIN_APP_NAME: process.env.NEXT_PUBLIC_ADMIN_APP_NAME,
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

/** Dev login open by default; set NEXT_PUBLIC_ADMIN_DEV_LOGIN=false to require real API auth. */
export function isAdminDevLoginEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ADMIN_DEV_LOGIN !== 'false';
}
