"use client";

import { storePostAuthRedirect } from "@/lib/auth/post-auth-redirect";

export function getGoogleOAuthUrl() {
  const backendOrigin =
    process.env.NEXT_PUBLIC_BACKEND_ORIGIN ||
    (typeof window !== "undefined"
      ? window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1"
        ? "https://velawear-api.onrender.com"
        : "http://localhost:8080"
      : process.env.NODE_ENV === "production"
        ? "https://velawear-api.onrender.com"
        : "http://localhost:8080");

  return `${backendOrigin}/oauth2/authorization/google`;
}

export function startGoogleOAuthLogin(redirectTo?: string | null) {
  storePostAuthRedirect(redirectTo);
  window.location.href = getGoogleOAuthUrl();
}
