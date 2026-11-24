/** @type {import('next').NextConfig} */

// Next.js configuration for App Router with standalone Docker output.
// output: "standalone" produces a minimal self-contained build in .next/standalone
// suitable for multi-stage Docker deployment without copying full node_modules.
const nextConfig = {
  output: "standalone",

  async headers() {
    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "img-src 'self' data: blob: https://lh3.googleusercontent.com https://i.ytimg.com",
      "media-src 'self' blob:",
      "font-src 'self' data:",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "connect-src 'self'",
      "frame-src 'self' blob: https://www.youtube-nocookie.com https://www.youtube.com",
      "worker-src 'self' blob:",
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Language", value: "en" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), geolocation=(), microphone=(self)",
          },
          {
            key: "Content-Security-Policy",
            value: csp,
          },
        ],
      },
    ];
  },

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
    instrumentationHook: true,
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
