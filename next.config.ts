import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@livrelibre/shared"],
  i18n: {
    locales: ["fr"],
    defaultLocale: "fr",
  },
  reactStrictMode: true,
  poweredByHeader: false,
  rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:3001/api/:path*",
      },
    ];
  },
};

export default nextConfig;
