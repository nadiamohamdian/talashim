import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@gold/contracts", "@gold/ui"],
  typedRoutes: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
