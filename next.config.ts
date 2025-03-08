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
  redirects: async () => {
    return [
      {
        source: "/:path*",
        has: [{ type: "header", key: "host", value: "www.cvhelper.in" }],
        destination: "https://cvhelper.in/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
