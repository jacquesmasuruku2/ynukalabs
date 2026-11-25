import type { NextConfig } from "next";

// En-têtes de sécurité appliqués à toutes les pages et API du panel admin.
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self), payment=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  reactStrictMode: true,
  poweredByHeader: false,
  output: "standalone",
  // Root explicite : le dossier parent contient d'autres lockfiles / espaces
  turbopack: {
    root: process.cwd(),
  },
  trailingSlash: false,
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;
