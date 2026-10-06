import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Verhindert "This page couldn't load"-Fehler nach einem Redeploy: ein
  // Browser-Tab, der noch die vorherige Version geladen hat, erkennt die
  // Abweichung anhand der Vercel-Commit-SHA und lädt dann hart neu statt
  // mit veralteten Chunks client-seitig zu navigieren.
  deploymentId: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 32),
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
