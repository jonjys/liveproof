import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow large video uploads in API routes (demo clips are short)
  experimental: {
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
};

export default nextConfig;
