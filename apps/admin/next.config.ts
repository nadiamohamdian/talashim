import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@sadafgold/ui", "@sadafgold/shared", "@sadafgold/types"],
  typedRoutes: true,
};

export default nextConfig;
