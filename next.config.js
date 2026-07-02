/** @type {import('next').NextConfig} */

// Next.js configuration for App Router with standalone Docker output.
// output: "standalone" produces a minimal self-contained build in .next/standalone
// suitable for multi-stage Docker deployment without copying full node_modules.
const nextConfig = {
  output: "standalone",

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },

  // Force-include Prisma CLI and engines in the standalone trace so
  // "npx prisma migrate deploy" works inside the production container
  // without downloading dependencies at runtime.
  experimental: {
    outputFileTracingIncludes: {
      "/": [
        "./node_modules/.bin/prisma",
        "./node_modules/prisma/**/*",
        "./node_modules/@prisma/**/*",
        "./node_modules/sharp/**/*",
        "./node_modules/@img/**/*",
      ],
    },
  },
};

module.exports = nextConfig;
