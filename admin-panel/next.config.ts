import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['127.0.0.1'],
  // Désactiver l'i18n pour l'admin-panel
  i18n: undefined,
};

export default nextConfig;
