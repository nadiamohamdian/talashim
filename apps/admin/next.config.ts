import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@sadafgold/ui",
    "@sadafgold/shared",
    "@talashim/shared",
    "@sadafgold/types",
    "@talashim/ui",
  ],
  typedRoutes: true,
};

export default nextConfig;
