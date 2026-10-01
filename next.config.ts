import type { NextConfig } from "next";
import { securityHeaders } from "./lib/security-headers";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
  async redirects() {
    return [
      {
        source: "/",
        has: [{ type: "host", value: "clientproof.nyttolabs.com" }],
        destination: "/check",
        permanent: false,
      },
      {
        source: "/r/:id",
        has: [{ type: "host", value: "clientproof.nyttolabs.com" }],
        destination: "/check/r/:id",
        permanent: false,
      },
    ];
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
