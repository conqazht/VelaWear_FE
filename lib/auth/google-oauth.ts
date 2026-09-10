"use client";

import { storePostAuthRedirect } from "@/lib/auth/post-auth-redirect";

export function getGoogleOAuthUrl() {
  const backendOrigin = process.env.NEXT_PUBLIC_BACKEND_ORIGIN;
  return backendOrigin
    ? `${backendOrigin}/oauth2/authorization/google`
    : "/oauth2/authorization/google";
}

export function startGoogleOAuthLogin(redirectTo?: string | null) {
  storePostAuthRedirect(redirectTo);
  window.location.href = getGoogleOAuthUrl();
}
