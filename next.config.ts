import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination:
          "https://sep490-8-wikichatbot-backends.onrender.com/api/:path*",
      },
    ];
  },
};

export default nextConfig;
