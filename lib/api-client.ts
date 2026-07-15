import axios from "axios";
import { getActiveLocale } from "./i18n";
import { createSignInHref } from "./auth/post-auth-redirect";

let accessToken: string | null = null;
let refreshPromise: Promise<string> | null = null;
let sessionExpiryRedirectStarted = false;
const authSessionLockName = "vela-auth-session";

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (token) sessionExpiryRedirectStarted = false;
}

function redirectExpiredSessionToSignIn() {
  if (typeof window === "undefined" || sessionExpiryRedirectStarted) return;
  if (window.location.pathname === "/sign-in") return;

  sessionExpiryRedirectStarted = true;
  const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  window.location.replace(createSignInHref(currentPath));
}

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

async function requestFreshAccessToken() {
  const response = await axios.post(
    `${apiClient.defaults.baseURL}/auth/refresh`,
    {},
    { timeout: 15_000, withCredentials: true },
  );
  const newAccessToken = response.data?.data?.accessToken;
  if (!newAccessToken) {
    throw new Error("Invalid refresh response format");
  }
  setAccessToken(newAccessToken);
  return newAccessToken as string;
}

export async function withAuthSessionLock<T>(operation: () => Promise<T>): Promise<T> {
  if (typeof navigator !== "undefined" && navigator.locks) {
    return await navigator.locks.request(
      authSessionLockName,
      async () => await operation(),
    );
  }
  return operation();
}

export async function logoutAuthSession(): Promise<void> {
  await withAuthSessionLock(async () => {
    const currentAccessToken = accessToken;
    try {
      try {
        await axios.post(
          `${apiClient.defaults.baseURL}/auth/logout`,
          {},
          {
            headers: currentAccessToken
              ? { Authorization: `Bearer ${currentAccessToken}` }
              : undefined,
            timeout: 15_000,
            withCredentials: true,
          },
        );
      } catch (error) {
        if (
          !currentAccessToken ||
          !axios.isAxiosError(error) ||
          error.response?.status !== 401
        ) {
          throw error;
        }

        // Token hết hạn có thể bị Spring Security chặn trước controller. Retry không
        // Bearer để controller vẫn thu hồi refresh cookie/session HttpOnly.
        await axios.post(
          `${apiClient.defaults.baseURL}/auth/logout`,
          {},
          { timeout: 15_000, withCredentials: true },
        );
      }
    } finally {
      setAccessToken(null);
    }
  });
}

export function refreshAccessTokenOnce(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = withAuthSessionLock(requestFreshAccessToken).finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

// Interceptor to attach access token and Accept-Language header to request headers
apiClient.interceptors.request.use(
  (config) => {
    if (config.headers) {
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      config.headers["Accept-Language"] = getActiveLocale();
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle automatic token refresh on 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Avoid infinite loop if refresh token endpoint itself returns 401
    if ([
      "/auth/refresh",
      "/auth/login",
      "/auth/logout",
      "/auth/oauth2/exchange",
    ].some((pathname) => originalRequest.url?.includes(pathname))) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const requestHadAccessToken = Boolean(
        accessToken || originalRequest.headers?.Authorization,
      );

      try {
        const newAccessToken = await refreshAccessTokenOnce();

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh token is expired or invalid, clear token
        setAccessToken(null);
        if (requestHadAccessToken) redirectExpiredSessionToSignIn();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
