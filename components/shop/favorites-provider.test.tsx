import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Wishlist } from "@/lib/api/types";
import type { Product } from "@/lib/vela-data";

const {
  mockCreateMyWishlist,
  mockDeleteMyWishlist,
  mockGetMyWishlists,
  mockGetProduct,
  mockPush,
  showAddedToFavoritesMock,
  useAuthMock,
  useI18nMock,
} = vi.hoisted(() => ({
  mockCreateMyWishlist: vi.fn(),
  mockDeleteMyWishlist: vi.fn(),
  mockGetMyWishlists: vi.fn(),
  mockGetProduct: vi.fn(),
  mockPush: vi.fn(),
  showAddedToFavoritesMock: vi.fn(),
  useAuthMock: vi.fn(),
  useI18nMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/components/auth/auth-provider", () => ({
  useAuth: useAuthMock,
}));

vi.mock("@/components/providers/i18n-provider", () => ({
  useI18n: useI18nMock,
}));

vi.mock("@/components/shop/notification-provider", () => ({
  useNotification: () => ({
    showAddedToFavorites: showAddedToFavoritesMock,
  }),
}));

vi.mock("@/lib/api/commerce", () => ({
  getMyWishlists: (...args: unknown[]) => mockGetMyWishlists(...args),
  createMyWishlist: (...args: unknown[]) => mockCreateMyWishlist(...args),
  deleteMyWishlist: (...args: unknown[]) => mockDeleteMyWishlist(...args),
}));

vi.mock("@/lib/api/catalog", () => ({
  getProduct: (...args: unknown[]) => mockGetProduct(...args),
}));

import { FavoritesProvider, useFavorites } from "./favorites-provider";

function makeWishlistItem(
  id: number,
  productId: number,
  name: string,
  slug: string
): Wishlist {
  return {
    id,
    userId: 1,
    productId,
    createdAt: "2026-08-07T12:00:00Z",
    product: {
      id: productId,
      slug,
      name,
      description: `Description for ${name}`,
      categoryId: 1,
      categoryName: "Áo",
      categorySlug: "ao",
      status: "ACTIVE",
      price: 500000,
      image: `/images/products/${slug}.webp`,
      thumbnail: `/images/products/${slug}-thumb.webp`,
    },
  };
}

function makeProduct(id: string, realId: number, name: string): Product {
  return {
    id,
    realId,
    name,
    description: `Description for ${name}`,
    price: 500000,
    image: `/images/products/${id}.webp`,
    color: "Black",
    size: "M",
    category: "Áo",
  };
}

describe("FavoritesProvider", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    vi.clearAllMocks();

    useAuthMock.mockReturnValue({
      isAuthenticated: true,
      user: { id: 1, email: "test@example.com" },
      isLoading: false,
    });

    useI18nMock.mockReturnValue({
      locale: "vi",
      t: (key: string) => key,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <FavoritesProvider>{children}</FavoritesProvider>
      </QueryClientProvider>
    );
  }

  it("tiêu thụ WishlistProductSummary từ 1 request getMyWishlists duy nhất mà không fan-out gọi getProduct", async () => {
    const item1 = makeWishlistItem(101, 1, "Linen Blazer", "linen-blazer");
    const item2 = makeWishlistItem(102, 2, "Cotton Shirt", "cotton-shirt");
    const item3 = makeWishlistItem(103, 3, "Silk Trousers", "silk-trousers");

    mockGetMyWishlists.mockResolvedValue({
      meta: { page: 1, pageSize: 100, pages: 1, total: 3 },
      result: [item1, item2, item3],
    });

    const { result } = renderHook(() => useFavorites(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.favorites).toHaveLength(3);
    expect(result.current.favorites[0].name).toBe("Linen Blazer");
    expect(result.current.favorites[0].realId).toBe(1);
    expect(result.current.favorites[1].name).toBe("Cotton Shirt");
    expect(result.current.favorites[2].name).toBe("Silk Trousers");

    expect(mockGetMyWishlists).toHaveBeenCalledTimes(1);
    expect(mockGetProduct).not.toHaveBeenCalled();
  });

  it("bỏ qua các sản phẩm inactive/deleted mà backend loại trừ trước phân trang, không tạo placeholder hay request phụ", async () => {
    const item1 = makeWishlistItem(101, 1, "Active Item 1", "active-1");
    const item2 = makeWishlistItem(103, 3, "Active Item 2", "active-2");

    mockGetMyWishlists.mockResolvedValue({
      meta: { page: 1, pageSize: 100, pages: 1, total: 2 },
      result: [item1, item2],
    });

    const { result } = renderHook(() => useFavorites(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.favorites).toHaveLength(2);
    expect(result.current.favorites.map((f) => f.realId)).toEqual([1, 3]);
    expect(mockGetProduct).not.toHaveBeenCalled();
  });

  it("thực hiện optimistic add vào favorites và rollback khi mutation thất bại", async () => {
    mockGetMyWishlists.mockResolvedValue({
      meta: { page: 1, pageSize: 100, pages: 1, total: 0 },
      result: [],
    });

    mockCreateMyWishlist.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useFavorites(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const newProduct = makeProduct("new-product", 99, "New Product");

    act(() => {
      result.current.addToFavorites(newProduct);
    });

    expect(result.current.favorites).toHaveLength(1);
    expect(result.current.favorites[0].id).toBe("new-product");

    await waitFor(() => {
      expect(result.current.favorites).toHaveLength(0);
    });

    expect(mockCreateMyWishlist).toHaveBeenCalledWith(99);
  });

  it("thực hiện optimistic remove từ favorites và rollback khi mutation thất bại", async () => {
    const item1 = makeWishlistItem(101, 1, "Linen Blazer", "linen-blazer");

    mockGetMyWishlists.mockResolvedValue({
      meta: { page: 1, pageSize: 100, pages: 1, total: 1 },
      result: [item1],
    });

    mockDeleteMyWishlist.mockRejectedValue(new Error("Delete failed"));

    const { result } = renderHook(() => useFavorites(), { wrapper });

    await waitFor(() => {
      expect(result.current.favorites).toHaveLength(1);
    });

    act(() => {
      result.current.removeFromFavorites("linen-blazer");
    });

    expect(result.current.favorites).toHaveLength(0);

    await waitFor(() => {
      expect(result.current.favorites).toHaveLength(1);
    });

    expect(mockDeleteMyWishlist).toHaveBeenCalledWith(1);
  });

  it("hỗ trợ retry khi query danh sách wishlist gặp lỗi", async () => {
    mockGetMyWishlists.mockRejectedValueOnce(new Error("Server error"));

    const { result } = renderHook(() => useFavorites(), { wrapper });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    const item1 = makeWishlistItem(101, 1, "Linen Blazer", "linen-blazer");
    mockGetMyWishlists.mockResolvedValueOnce({
      meta: { page: 1, pageSize: 100, pages: 1, total: 1 },
      result: [item1],
    });

    act(() => {
      result.current.retry();
    });

    await waitFor(() => {
      expect(result.current.favorites).toHaveLength(1);
      expect(result.current.error).toBeNull();
    });
  });
});
