import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Mengabaikan error TypeScript saat build
  typescript: {
    ignoreBuildErrors: true,
  },
  // @ts-ignore: Mengabaikan peringatan tipe pada eslint
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;