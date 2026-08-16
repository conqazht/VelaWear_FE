import type { NextConfig } from "next";

const apiBaseUrl = new URL(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1");
const productUploadsPattern = new URL("/uploads/products/**", apiBaseUrl);
const isLoopbackApi = ["localhost", "127.0.0.1", "[::1]"].includes(apiBaseUrl.hostname);

const nextConfig: NextConfig = {
  cacheComponents: true,
  devIndicators: false,
  images: {
    dangerouslyAllowLocalIP: process.env.NODE_ENV === "development" && isLoopbackApi,
    remotePatterns: [productUploadsPattern],
  },
};

export default nextConfig;
