import { config as loadEnv } from "dotenv";
import { defineConfig, env } from "prisma/config";
import { fileURLToPath } from "node:url";

loadEnv({
  path: fileURLToPath(new URL("../../.env", import.meta.url)),
});
loadEnv({
  path: fileURLToPath(new URL(".env", import.meta.url)),
});

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
    ...(process.env.DIRECT_DATABASE_URL
      ? { directUrl: process.env.DIRECT_DATABASE_URL }
      : {}),
  },
});
