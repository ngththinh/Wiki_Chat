import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination:
          "https://sep490wikichatbotbackends-cmb2ajgqgpe8c9ha.japanwest-01.azurewebsites.net/api/:path*",
      },
    ];
  },
};

export default nextConfig;
