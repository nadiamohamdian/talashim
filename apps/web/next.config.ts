import type { NextConfig } from "next";
import { config as loadDotenv } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** Load monorepo root `.env` (Next only auto-loads env files inside apps/web). */
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
loadDotenv({ path: path.join(repoRoot, ".env") });
loadDotenv({ path: path.join(repoRoot, ".env.local"), override: true });

const nextConfig: NextConfig = {
  transpilePackages: ["@sadafgold/types", "@sadafgold/ui", "@sadafgold/shared"],
  typedRoutes: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: false,
  },
};

export default nextConfig;
