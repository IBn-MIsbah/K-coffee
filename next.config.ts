import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep browser/integration servers independent from a developer's local dev server.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.stockcake.com",
      },
    ],
  },
};

export default nextConfig;
