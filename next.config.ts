import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Mengabaikan error TypeScript dan ESLint saat proses build di Vercel
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;