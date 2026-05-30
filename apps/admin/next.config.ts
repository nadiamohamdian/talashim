import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@gold/ui", "@gold/shared", "@gold/types"],
  typedRoutes: true,
};

export default nextConfig;
