import type { NextConfig } from 'next';
import { config as loadDotenv } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** Monorepo root `.env` (BRS_API_KEY, NEXT_PUBLIC_*, etc.) — Next only auto-loads `apps/web/.env`. */
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
loadDotenv({ path: path.join(repoRoot, '.env') });
loadDotenv({ path: path.join(repoRoot, '.env.local'), override: true });

// Load after dotenv so NEXT_PUBLIC_API_BASE_URL is available for image remote patterns.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { buildImageRemotePatterns } = require('./src/shared/config/image-hosts') as typeof import('./src/shared/config/image-hosts');

const nextConfig: NextConfig = {
  transpilePackages: [
    '@talashim/types',
    '@talashim/ui',
    '@talashim/shared',
    '@sadafgold/types',
    '@sadafgold/ui',
    '@sadafgold/shared',
  ],
  typedRoutes: false,
  images: {
    remotePatterns: buildImageRemotePatterns(),
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: false,
  },
};

export default nextConfig;
