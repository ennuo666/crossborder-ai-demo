import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    // Next 15.5's segment explorer can fail to resolve its optional userspace
    // module on Windows during webpack development. It is not needed by the MVP.
    devtoolSegmentExplorer: false,
  },
};

export default nextConfig;
