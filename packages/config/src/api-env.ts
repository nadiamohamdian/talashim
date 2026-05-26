import { z } from "zod";
import { sharedEnvSchema } from "./shared";

export const apiEnvSchema = sharedEnvSchema.extend({
  API_PORT: z.coerce.number().int().positive().default(4000),
  API_PREFIX: z.string().min(1).default("api"),
  API_VERSION: z.string().min(1).default("v1"),
  WEB_URL: z.string().url().default("http://localhost:3000"),
  CORS_ORIGIN: z.string().url().default("http://localhost:3000"),
  COOKIE_DOMAIN: z.string().min(1).default("localhost"),
  DATABASE_URL: z.string().min(1),
  DIRECT_DATABASE_URL: z.string().min(1).optional(),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_TTL: z.string().min(2).default("15m"),
  JWT_REFRESH_TTL: z.string().min(2).default("7d"),
});

export type ApiEnv = z.infer<typeof apiEnvSchema>;
