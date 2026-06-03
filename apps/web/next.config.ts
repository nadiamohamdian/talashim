import type { NextConfig } from 'next';
import { config as loadDotenv } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildImageRemotePatterns } from './src/shared/config/image-hosts';

/** Monorepo root `.env` (BRS_API_KEY, NEXT_PUBLIC_*, etc.) — Next only auto-loads `apps/web/.env`. */
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
loadDotenv({ path: path.join(repoRoot, '.env') });
loadDotenv({ path: path.join(repoRoot, '.env.local'), override: true });

const nextConfig: NextConfig = {
  transpilePackages: ['@sadafgold/types', '@sadafgold/ui', '@sadafgold/shared'],
  typedRoutes: false,
  images: {
    remotePatterns: buildImageRemotePatterns(),
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: false,
  },
};

export default nextConfig;
