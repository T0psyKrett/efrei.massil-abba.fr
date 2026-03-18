import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow firebase-admin to run server-side only
  serverExternalPackages: ["firebase-admin", "mammoth"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
    ],
  },
};

export default nextConfig;
