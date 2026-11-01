import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/supabase/:path*',
        // Hapus huruf 's' sebelum 'psddbelep'
        destination: 'https://tkgbahpoqakpsddbelep.supabase.co/:path*',
      },
    ];
  },
};

export default nextConfig;