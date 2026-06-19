import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.qrserver.com",
        pathname: "/v1/create-qr-code/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  turbopack: {
    root: "./frontend",
  },
};

export default nextConfig;
