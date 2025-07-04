import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        "https://localhost:3000",
        "https://stagingxpay.info"
      ]
    }
  }
};

export default nextConfig;
