import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "afnmhrgbsqaaoclzflnn.supabase.co",
      },
    ],
  },
};

export default nextConfig;
