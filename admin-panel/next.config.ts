import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: "standalone",
  trailingSlash: false,
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  // Désactiver l'i18n pour l'admin-panel
  i18n: undefined,
};

export default nextConfig;
