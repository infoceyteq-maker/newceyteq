import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,

  // Native/WASM database drivers must stay outside the bundler.
  serverExternalPackages: ["@electric-sql/pglite", "pg"],

  // The sandbox serves the dev server through a proxied preview host.
  allowedDevOrigins: ["*.e2b.app", "*.arena.ai", "localhost", "127.0.0.1"],

  // Security headers are set per-request in src/middleware.ts (CSP, CORS,
  // HSTS). These apply to the assets middleware skips.
  headers: async () => [
    {
      source: "/brand/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
      ],
    },
  ],

  images: {
    formats: ["image/avif", "image/webp"],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
