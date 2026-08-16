import { StrictMode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { User } from "@/lib/api/types";
import { queryKeys } from "@/lib/queries/keys";
import { OAuth2CallbackClient } from "./oauth2-callback-client";

const navigationMocks = vi.hoisted(() => {
  const replace = vi.fn();
  return {
    replace,
    router: { replace },
    search: "",
  };
});

const authApiMocks = vi.hoisted(() => ({
  exchangeOAuth2Code: vi.fn(),
  getMe: vi.fn(),
}));

const postAuthMocks = vi.hoisted(() => ({
  clearPostAuthRedirect: vi.fn(),
  redirectTo: "/checkout" as string | null,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => navigationMocks.router,
  useSearchParams: () => new URLSearchParams(navigationMocks.search),
}));

vi.mock("@/lib/api/auth", () => ({
  exchangeOAuth2Code: authApiMocks.exchangeOAuth2Code,
  getMe: authApiMocks.getMe,
}));

vi.mock("@/lib/auth/post-auth-redirect", () => ({
  clearPostAuthRedirect: postAuthMocks.clearPostAuthRedirect,
  createSignInHref: (redirectTo?: string | null) =>
    redirectTo ? `/sign-in?redirect=${encodeURIComponent(redirectTo)}` : "/sign-in",
  getStoredPostAuthRedirect: () => postAuthMocks.redirectTo,
}));

vi.mock("@/lib/auth/roles", () => ({
  getPostSignInPath: () => "/profile",
  getRoleSessionLabel: () => "customer",
}));

vi.mock("@/components/providers/i18n-provider", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock("@/lib/i18n/messages/auth-errors", () => ({
  getAuthRoleMessageKey: (role: string) => `auth.role.${role}`,
}));

vi.mock("@/components/auth/auth-loader", () => ({
  AuthLoader: ({ message }: { message?: string }) => <div>{message}</div>,
}));

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
};

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

const profile: User = {
  id: 42,
  email: "member@vela.test",
  fullName: "Vela Member",
  birthDate: null,
  avatar: null,
  gender: null,
  createdAt: "2026-07-16T00:00:00Z",
  updatedAt: "2026-07-16T00:00:00Z",
  hasPassword: false,
  roles: [{ id: 1, name: "CUSTOMER" }],
};

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function renderCallback(queryClient: QueryClient, strict = false) {
  const callback = (
    <QueryClientProvider client={queryClient}>
      <OAuth2CallbackClient />
    </QueryClientProvider>
  );

  return render(strict ? <StrictMode>{callback}</StrictMode> : callback);
}

describe("OAuth2CallbackClient", () => {
  beforeEach(() => {
    navigationMocks.search = "";
    navigationMocks.replace.mockClear();
    authApiMocks.exchangeOAuth2Code.mockReset();
    authApiMocks.getMe.mockReset();
    postAuthMocks.clearPostAuthRedirect.mockClear();
    postAuthMocks.redirectTo = "/checkout";
  });

  it("dùng lại toàn bộ completion khi StrictMode remount sau exchange", async () => {
    navigationMocks.search = "code=oauth-remount";
    const exchange = deferred<{ accessToken: string }>();
    const profileRequest = deferred<User>();
    authApiMocks.exchangeOAuth2Code.mockReturnValue(exchange.promise);
    authApiMocks.getMe.mockReturnValue(profileRequest.promise);
    const queryClient = createQueryClient();

    const firstRender = renderCallback(queryClient, true);
    await waitFor(() => {
      expect(authApiMocks.exchangeOAuth2Code).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      exchange.resolve({ accessToken: "oauth-access-token" });
      await exchange.promise;
    });
    await waitFor(() => {
      expect(authApiMocks.getMe).toHaveBeenCalledTimes(1);
    });

    firstRender.unmount();
    renderCallback(queryClient, true);

    expect(authApiMocks.exchangeOAuth2Code).toHaveBeenCalledTimes(1);
    expect(authApiMocks.getMe).toHaveBeenCalledTimes(1);

    await act(async () => {
      profileRequest.resolve(profile);
      await profileRequest.promise;
    });

    await waitFor(() => {
      expect(navigationMocks.replace).toHaveBeenCalledWith("/checkout");
    });
    expect(queryClient.getQueryData(queryKeys.auth.session)).toEqual(profile);
    expect(postAuthMocks.clearPostAuthRedirect).toHaveBeenCalledTimes(1);
  });

  it("giữ nguyên exchange failure cho remount cùng code", async () => {
    navigationMocks.search = "code=oauth-invalid";
    const exchange = deferred<{ accessToken: string }>();
    authApiMocks.exchangeOAuth2Code.mockReturnValue(exchange.promise);
    const queryClient = createQueryClient();

    const firstRender = renderCallback(queryClient);
    await waitFor(() => {
      expect(authApiMocks.exchangeOAuth2Code).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      exchange.reject(new Error("invalid_grant"));
      await exchange.promise.catch(() => undefined);
    });
    await waitFor(() => {
      expect(navigationMocks.replace).toHaveBeenCalledWith(
        "/sign-in?redirect=%2Fcheckout&error=oauth2_login_failed",
      );
    });

    firstRender.unmount();
    navigationMocks.replace.mockClear();
    renderCallback(queryClient);

    await waitFor(() => {
      expect(navigationMocks.replace).toHaveBeenCalledWith(
        "/sign-in?redirect=%2Fcheckout&error=oauth2_login_failed",
      );
    });
    expect(authApiMocks.exchangeOAuth2Code).toHaveBeenCalledTimes(1);
    expect(authApiMocks.getMe).not.toHaveBeenCalled();
  });

  it("bắt đầu completion mới khi callback nhận code khác", async () => {
    const queryClient = createQueryClient();
    authApiMocks.exchangeOAuth2Code.mockResolvedValue({ accessToken: "token" });
    authApiMocks.getMe.mockResolvedValue(profile);

    navigationMocks.search = "code=oauth-first";
    const firstRender = renderCallback(queryClient);
    await waitFor(() => {
      expect(navigationMocks.replace).toHaveBeenCalledWith("/checkout");
    });
    firstRender.unmount();

    navigationMocks.search = "code=oauth-second";
    navigationMocks.replace.mockClear();
    renderCallback(queryClient);
    await waitFor(() => {
      expect(navigationMocks.replace).toHaveBeenCalledWith("/checkout");
    });

    expect(authApiMocks.exchangeOAuth2Code).toHaveBeenCalledTimes(2);
    expect(authApiMocks.exchangeOAuth2Code).toHaveBeenNthCalledWith(1, {
      code: "oauth-first",
    });
    expect(authApiMocks.exchangeOAuth2Code).toHaveBeenNthCalledWith(2, {
      code: "oauth-second",
    });
    expect(authApiMocks.getMe).toHaveBeenCalledTimes(2);
  });
});
