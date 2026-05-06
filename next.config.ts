import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel automatically detects Next.js — no special output config needed.
  // Enable image optimization for external sources if needed
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;