import { webEnvSchema } from "@sadafgold/shared/web-env";

export const webEnv = webEnvSchema.parse({
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_WS_BASE_URL: process.env.NEXT_PUBLIC_WS_BASE_URL,
  NEXT_PUBLIC_GOLD_TRADE_COMMISSION_PERCENT:
    process.env.NEXT_PUBLIC_GOLD_TRADE_COMMISSION_PERCENT,
});

export function getWsBaseUrl() {
  if (webEnv.NEXT_PUBLIC_WS_BASE_URL) {
    return webEnv.NEXT_PUBLIC_WS_BASE_URL;
  }
  const apiUrl = new URL(webEnv.NEXT_PUBLIC_API_BASE_URL);
  return `${apiUrl.protocol}//${apiUrl.host}`;
}
