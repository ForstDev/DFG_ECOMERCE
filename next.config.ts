import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dfgtruckparts.com",
        pathname: "/wp-content/uploads/**",
      },
    ],
    // Product photography is shot on white. Keep the source aspect, never crop.
    formats: ["image/avif", "image/webp"],
    // The originals live on dfgtruckparts.com and effectively never change, so
    // an optimised copy is worth holding for a month. It also keeps a slow or
    // rate-limiting upstream from being re-hit on every visit.
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

export default nextConfig;
