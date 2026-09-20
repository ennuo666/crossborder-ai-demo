import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Keep a local dev server from replacing assets used by next start.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  experimental: {
    // Next 15.5's segment explorer can fail to resolve its optional userspace
    // module on Windows during webpack development. It is not needed by the MVP.
    devtoolSegmentExplorer: false,
  },
};

export default nextConfig;
