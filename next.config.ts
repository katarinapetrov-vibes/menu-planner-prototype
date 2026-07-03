import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production'

const nextConfig: NextConfig = {
  output: isProd ? 'export' : undefined,
  basePath: isProd ? '/menu-planner-prototype' : '',
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
    unoptimized: true,
  },
  turbopack: {
    root: __dirname,
  },
  experimental: {
    optimizePackageImports: [
      'date-fns',
      'framer-motion',
      'recharts',
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
