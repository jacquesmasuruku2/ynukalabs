import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
