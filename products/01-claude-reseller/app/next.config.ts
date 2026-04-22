import type { NextConfig } from "next";

const config: NextConfig = {
  // Enable React strict mode — catches double-render issues early
  reactStrictMode: true,

  images: {
    remotePatterns: [
      // Clerk hosted avatars
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

  // Enforce no `any` at build time via TypeScript strict checks
  typescript: {
    // Build fails on TS errors — no silent any slipping through CI
    ignoreBuildErrors: false,
  },

  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default config;
