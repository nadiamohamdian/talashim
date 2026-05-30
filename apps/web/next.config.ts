import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@gold/types", "@gold/ui", "@gold/shared"],
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
