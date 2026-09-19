import type { NextConfig } from "next";
import { securityHeaders } from "./lib/security-headers";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
  async headers() {
    const headers = Object.entries(securityHeaders()).map(([key, value]) => ({
      key,
      value,
    }));
    return [{ source: "/:path*", headers }];
  },
};

export default nextConfig;
