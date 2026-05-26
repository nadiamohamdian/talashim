import { sharedEnvSchema } from "./shared";

export const webEnvSchema = sharedEnvSchema.pick({
  NEXT_PUBLIC_APP_NAME: true,
  NEXT_PUBLIC_API_BASE_URL: true,
});
