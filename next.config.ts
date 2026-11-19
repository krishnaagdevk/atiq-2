import type { NextConfig } from "next";

const isApkBuild = process.env.BUILD_TARGET === "apk";

const nextConfig: NextConfig = {
  ...(isApkBuild ? { output: "export" } : {}),
  images: {
    unoptimized: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
