import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpile shared workspace packages so Next.js compiles them
  transpilePackages: ["@codeatlas/ui", "@codeatlas/types", "@codeatlas/config", "@codeatlas/utils"],
  reactStrictMode: true,
};

export default nextConfig;
