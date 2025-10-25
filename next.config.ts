import type { NextConfig } from "next";

import { env } from "./src/validate_env";

let DEFAULT_SRC = process.env.AUTHORIZED_DOMAINS
  ? `'self' ${process.env.AUTHORIZED_DOMAINS}`
  : "'self'";
if (process.env.NODE_ENV === "development") {
  DEFAULT_SRC += " 'unsafe-eval' 'unsafe-inline'";
}
const ContentSecurityPolicy = `
  default-src ${DEFAULT_SRC};
  style-src 'self' 'unsafe-inline';
  frame-ancestors 'self';
`;

const securityHeaders: { key: string; value: string }[] = [
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Permissions-Policy",
    value: "interest-cohort=()",
  },
  {
    key: "Referrer-Policy",
    value: "no-referrer-when-downgrade",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: ContentSecurityPolicy.replace(/\s{2,}/g, " ").trim(),
  },
];

const nextConfig: NextConfig = {
  env,
  i18n: {
    locales: ["fr"],
    defaultLocale: "fr",
  },
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
