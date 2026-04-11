import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercelではstandalone不要（自動最適化される）
  // VPS等にセルフホストする場合はコメントを外す
  // output: "standalone",

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hojokin-portal.jp",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
