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
      {
        protocol: "https",
        hostname: "img.clerk.com", // ✅ Moved Clerk's domain here
      },
    ],
  },
};

export default nextConfig;
