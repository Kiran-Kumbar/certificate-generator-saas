import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["canvas", "archiver"],
  outputFileTracingIncludes: {
    "/api/**/*": ["./public/fonts/**/*", "./public/templates/**/*"],
  },
};

export default nextConfig;
