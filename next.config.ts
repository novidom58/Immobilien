import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d8j0ntlcm91z4.cloudfront.net",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
    qualities: [70, 75],
  },
};

export default nextConfig;
