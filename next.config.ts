import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "v28ii7hrfrg6v5lk.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
