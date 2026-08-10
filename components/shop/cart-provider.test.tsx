import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockGetMyCart = vi.fn();
const mockReplaceMyCartItems = vi.fn();

vi.mock("@/lib/api/commerce", () => ({
  getMyCart: (...args: unknown[]) => mockGetMyCart(...args),
  replaceMyCartItems: (...args: unknown[]) => mockReplaceMyCartItems(...args),
}));

vi.mock("@/components/auth/auth-provider", () => ({
  useAuth: vi.fn(),
}));

// Mock i18n
vi.mock("@/components/providers/i18n-provider", () => ({
  useI18n: () => ({ locale: "en", t: (k: string) => k }),
}));
vi.mock("@/lib/i18n", () => ({
  getActiveLocale: () => "en",
}));

import { useAuth } from "@/components/auth/auth-provider";
import { CartProvider, useCart } from "@/components/shop/cart-provider";
import type { CartItem, Product } from "@/lib/vela-data";
import { useCartStore } from "@/store/cart-store";

describe("CartProvider ownership", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.resetModules();
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem("vela-cart-v1");
      localStorage.removeItem("vela-cart-v2");
    }
    useCartStore.setState({ cart: [], owner: "anonymous" });
    mockGetMyCart.mockReset();
    mockGetMyCart.mockResolvedValue({ items: [] });
    mockReplaceMyCartItems.mockReset();
    mockReplaceMyCartItems.mockResolvedValue({ items: [] });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <CartProvider>{children}</CartProvider>
      </QueryClientProvider>
    );
  }

  function makeItem(variantId: number): CartItem {
    return {
      id: `variant-${variantId}`,
      productId: variantId,
      productSlug: `slug-${variantId}`,
      name: `Product ${variantId}`,
      price: 100,
      quantity: 1,
      variantId,
      color: "Black",
      size: "M",
      image: "placeholder.png",
    };
  }

  it("không expose cart của user khác (user:42) khi đang auth loading", () => {
    useCartStore.setState({ cart: [makeItem(1)], owner: "user:42" });
    vi.mocked(useAuth).mockReturnValue({ isAuthenticated: false, user: null, isLoading: true } as ReturnType<typeof useAuth>);

    const { result } = renderHook(() => useCart(), { wrapper });

    // Khi auth loading, giấu cart nếu owner != anonymous
    expect(result.current.cart).toEqual([]);
  });

  it("expose guest cart (anonymous) khi đang auth loading", () => {
    useCartStore.setState({ cart: [makeItem(1)], owner: "anonymous" });
    vi.mocked(useAuth).mockReturnValue({ isAuthenticated: false, user: null, isLoading: true } as ReturnType<typeof useAuth>);

    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cart[0].variantId).toBe(1);
  });

  it("merge guest cart vào user 42 khi mount (guest claim)", async () => {
    useCartStore.setState({ cart: [makeItem(1)], owner: "anonymous" });
    vi.mocked(useAuth).mockReturnValue({ isAuthenticated: true, user: { id: 42 }, isLoading: false } as ReturnType<typeof useAuth>);

    renderHook(() => useCart(), { wrapper });

    await waitFor(() => {
      expect(useCartStore.getState().owner).toBe("user:42");
    });
  });

  it("không gửi item của user 42 lên server khi user 99 login (A→B clear mismatch)", async () => {
    useCartStore.setState({ cart: [makeItem(1)], owner: "user:42" });
    vi.mocked(useAuth).mockReturnValue({ isAuthenticated: true, user: { id: 99 }, isLoading: false } as ReturnType<typeof useAuth>);

    renderHook(() => useCart(), { wrapper });

    await waitFor(() => {
      expect(useCartStore.getState().owner).toBe("user:99");
    });

    await new Promise((r) => setTimeout(r, 300));
    const latestCall = mockReplaceMyCartItems.mock.lastCall;
    if (latestCall) {
      expect(latestCall[0].items).toEqual([]);
    }
  });

  it("giải phóng owner cũ thành anonymous khi auth load xong và chưa login", async () => {
    useCartStore.setState({ cart: [makeItem(1)], owner: "user:42" });
    vi.mocked(useAuth).mockReturnValue({ isAuthenticated: false, user: null, isLoading: false } as ReturnType<typeof useAuth>);

    renderHook(() => useCart(), { wrapper });

    await waitFor(() => {
      expect(useCartStore.getState().owner).toBe("anonymous");
      expect(useCartStore.getState().cart).toEqual([]);
    });
  });

  it("cho phép guest thêm sản phẩm vào giỏ hàng ngay cả khi storedOwner từng là user:42", async () => {
    useCartStore.setState({ cart: [], owner: "user:42" });
    vi.mocked(useAuth).mockReturnValue({ isAuthenticated: false, user: null, isLoading: false } as ReturnType<typeof useAuth>);

    const { result } = renderHook(() => useCart(), { wrapper });

    const dummyProduct = {
      id: "product-1",
      realId: 101,
      name: "Áo sơ mi Linen",
      price: 250000,
      image: "/shirt.jpg",
      color: "Trắng",
      size: "L",
    };

    result.current.addToCart(dummyProduct as unknown as Product);

    await waitFor(() => {
      expect(useCartStore.getState().owner).toBe("anonymous");
      expect(result.current.cart).toHaveLength(1);
      expect(result.current.itemCount).toBe(1);
      expect(result.current.cart[0].name).toBe("Áo sơ mi Linen");
    });
  });
});
