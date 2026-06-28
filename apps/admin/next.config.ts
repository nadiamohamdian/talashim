import type { NextConfig } from 'next';
import { config as loadDotenv } from 'dotenv';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

/** Monorepo root `.env` — Next only auto-loads `apps/admin/.env`. */
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
loadDotenv({ path: path.join(repoRoot, '.env') });
loadDotenv({ path: path.join(repoRoot, '.env.local'), override: true });

const reduxToolkitPath = path.join(repoRoot, 'node_modules/@reduxjs/toolkit');
const reactReduxPath = path.join(repoRoot, 'node_modules/react-redux');

const nextConfig: NextConfig = {
  transpilePackages: [
    '@sadafgold/ui',
    '@sadafgold/shared',
    '@talashim/shared',
    '@sadafgold/types',
    '@talashim/ui',
    'recharts',
  ],
  turbopack: {
    resolveAlias: {
      '@reduxjs/toolkit': pathToFileURL(reduxToolkitPath).href,
      'react-redux': pathToFileURL(reactReduxPath).href,
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@reduxjs/toolkit': reduxToolkitPath,
      'react-redux': reactReduxPath,
    };
    return config;
  },
  typedRoutes: true,
};

export default nextConfig;
