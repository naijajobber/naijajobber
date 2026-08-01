import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.onrender.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  // Keep App Router SSR (do not use output: "export") so Vercel serves
  // deep links like /dashboard/seeker without SPA 404s on refresh.
  trailingSlash: false,
  poweredByHeader: false,
};

export default nextConfig;
