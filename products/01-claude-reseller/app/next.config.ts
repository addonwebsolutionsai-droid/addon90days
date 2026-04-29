import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.clerk.dev",
        pathname: "/**",
      },
    ],
  },

  typescript: {
    ignoreBuildErrors: false,
  },

  eslint: {
    ignoreDuringBuilds: false,
  },

  async redirects() {
    return [
      {
        source: "/dashboard",
        destination: "/account",
        permanent: false,
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://clerk.com https://*.clerk.accounts.dev",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://img.clerk.com https://images.clerk.dev",
              "font-src 'self'",
              "connect-src 'self' https://*.supabase.co https://clerk.com https://*.clerk.accounts.dev https://api.clerk.dev",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
      {
        source: "/api/(.*)",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      },
    ];
  },
};

export default config;
