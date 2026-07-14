const POST_AUTH_REDIRECT_KEY = "vela.post-auth-redirect";
const AUTH_PATHS = ["/sign-in", "/register", "/forgot-password", "/auth/oauth2/callback"];

export function getSafeInternalRedirect(value: string | null | undefined) {
  if (!value) return null;

  const candidate = value.trim();
  if (!candidate.startsWith("/") || candidate.startsWith("//") || candidate.includes("\\")) {
    return null;
  }

  try {
    const parsed = new URL(candidate, "https://vela-wear.local");
    if (parsed.origin !== "https://vela-wear.local") return null;
    if (AUTH_PATHS.some((path) => parsed.pathname === path || parsed.pathname.startsWith(`${path}/`))) {
      return null;
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return null;
  }
}

export function createSignInHref(redirectTo?: string | null) {
  const safeRedirect = getSafeInternalRedirect(redirectTo);
  if (!safeRedirect) return "/sign-in";

  const params = new URLSearchParams({ redirect: safeRedirect });
  return `/sign-in?${params.toString()}`;
}

export function storePostAuthRedirect(redirectTo?: string | null) {
  if (typeof window === "undefined") return;

  const safeRedirect = getSafeInternalRedirect(redirectTo);
  if (safeRedirect) {
    window.sessionStorage.setItem(POST_AUTH_REDIRECT_KEY, safeRedirect);
  } else {
    window.sessionStorage.removeItem(POST_AUTH_REDIRECT_KEY);
  }
}

export function getStoredPostAuthRedirect() {
  if (typeof window === "undefined") return null;

  const storedRedirect = window.sessionStorage.getItem(POST_AUTH_REDIRECT_KEY);
  return getSafeInternalRedirect(storedRedirect);
}

export function clearPostAuthRedirect() {
  if (typeof window === "undefined") return;

  window.sessionStorage.removeItem(POST_AUTH_REDIRECT_KEY);
}
