import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Native/WASM database drivers must stay outside the bundler.
  serverExternalPackages: ["@electric-sql/pglite", "pg"],
  // The sandbox serves the dev server through a proxied preview host.
  allowedDevOrigins: ["*.e2b.app", "*.arena.ai", "localhost", "127.0.0.1"],
  reactStrictMode: true,
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
      ],
    },
  ],
};

export default nextConfig;
