import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockLogout = vi.fn();
vi.mock("@/lib/api/auth", () => ({
  logout: () => mockLogout(),
  getSessionUser: vi.fn().mockResolvedValue(null),
  login: vi.fn(),
  register: vi.fn(),
}));

import { AuthProvider, useAuth } from "@/components/auth/auth-provider";
import { useCartStore } from "@/store/cart-store";

describe("AuthProvider", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.resetModules();
    window.localStorage.removeItem("vela-auth-session-hint");
    useCartStore.setState({ cart: [], owner: "user:42" });
    mockLogout.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    );
  }

  it("signOut calls api and releases cart to anonymous", async () => {
    mockLogout.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await result.current.signOut();

    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(useCartStore.getState().owner).toBe("anonymous");
  });

  it("signOut throws and keeps cart ownership on network error", async () => {
    const error = new Error("Network error");
    mockLogout.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await expect(result.current.signOut()).rejects.toThrow("Network error");

    expect(mockLogout).toHaveBeenCalledTimes(1);
    // Because logout rejected, releaseToAnonymous is skipped
    expect(useCartStore.getState().owner).toBe("user:42");
  });

  it("hasSessionHint is false for fresh anonymous visitors", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.hasSessionHint).toBe(false);
  });

  it("hasSessionHint is true when a previous login hint exists", () => {
    window.localStorage.setItem("vela-auth-session-hint", "1");
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.hasSessionHint).toBe(true);
  });
});
