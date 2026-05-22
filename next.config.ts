import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '', // Leave empty if default HTTPS port (443)
        pathname: '**', // Allow any path under this hostname
      },
    ],
  },
};

export default nextConfig;
