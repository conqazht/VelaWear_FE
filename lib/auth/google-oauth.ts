"use client";

const DEFAULT_BACKEND_ORIGIN = "http://localhost:8080";

export function getGoogleOAuthUrl() {
  const backendOrigin = process.env.NEXT_PUBLIC_BACKEND_ORIGIN || DEFAULT_BACKEND_ORIGIN;
  return `${backendOrigin}/oauth2/authorization/google`;
}

export function startGoogleOAuthLogin() {
  window.location.href = getGoogleOAuthUrl();
}
