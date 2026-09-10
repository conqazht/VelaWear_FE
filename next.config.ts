import type { NextConfig } from "next";

const backendOriginString =
  process.env.BACKEND_ORIGIN ??
  process.env.BACKEND_API_ORIGIN ??
  (process.env.BACKEND_API_URL
    ? new URL(process.env.BACKEND_API_URL).origin
    : (process.env.NEXT_PUBLIC_BACKEND_ORIGIN ??
      (process.env.NEXT_PUBLIC_API_URL?.startsWith("http")
        ? process.env.NEXT_PUBLIC_API_URL
        : "http://localhost:8080")));
const backendOrigin = new URL(backendOriginString);
const productUploadsPattern = new URL("/uploads/products/**", backendOrigin);
const isLoopbackApi = ["localhost", "127.0.0.1", "[::1]"].includes(backendOrigin.hostname);

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  devIndicators: false,
  images: {
    dangerouslyAllowLocalIP: process.env.NODE_ENV === "development" && isLoopbackApi,
    remotePatterns: [productUploadsPattern],
  },
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: `${backendOrigin.origin}/uploads/:path*`,
      },
      {
        source: "/oauth2/:path*",
        destination: `${backendOrigin.origin}/oauth2/:path*`,
      },
    ];
  },
};

export default nextConfig;
