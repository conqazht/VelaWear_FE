import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  useAuthMock,
  useFavoritesMock,
  useI18nMock,
  useMyAddressesQueryMock,
  useMyOrdersQueryMock,
  useNotificationMock,
  useSearchParamsMock,
  useUpdateProfileMutationMock,
} = vi.hoisted(() => ({
  useAuthMock: vi.fn(),
  useFavoritesMock: vi.fn(),
  useI18nMock: vi.fn(),
  useMyAddressesQueryMock: vi.fn(),
  useMyOrdersQueryMock: vi.fn(),
  useNotificationMock: vi.fn(),
  useSearchParamsMock: vi.fn(),
  useUpdateProfileMutationMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => useSearchParamsMock(),
}));

vi.mock("@/components/auth/auth-provider", () => ({
  useAuth: useAuthMock,
}));

vi.mock("@/components/providers/i18n-provider", () => ({
  useI18n: useI18nMock,
}));

vi.mock("@/components/shop/favorites-provider", () => ({
  useFavorites: useFavoritesMock,
}));

vi.mock("@/components/shop/cart-provider", () => ({
  useCart: () => ({ addToCart: vi.fn() }),
}));

vi.mock("@/components/shop/notification-provider", () => ({
  useNotification: useNotificationMock,
}));

vi.mock("@/components/shop/fashion-image", () => ({
  FashionImage: ({ alt }: { alt: string }) => <span>{alt}</span>,
}));

vi.mock("@/lib/queries/commerce", () => ({
  useMyOrdersQuery: (...args: unknown[]) => useMyOrdersQueryMock(...args),
  useMyAddressesQuery: (...args: unknown[]) => useMyAddressesQueryMock(...args),
  useUpdateProfileMutation: () => useUpdateProfileMutationMock(),
}));

import MemberProfile from "./page";

describe("MemberProfile demand-gated data loading (FE-008)", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useAuthMock.mockReturnValue({
      isAuthenticated: true,
      user: { id: 1, email: "test@example.com", fullName: "Test User" },
      isLoading: false,
    });

    useI18nMock.mockReturnValue({
      locale: "vi",
      t: (key: string) => key,
    });

    useFavoritesMock.mockReturnValue({
      favorites: [],
      toggleFavorite: vi.fn(),
      isLoading: false,
      error: null,
      retry: vi.fn(),
    });

    useNotificationMock.mockReturnValue({
      showAddedToBag: vi.fn(),
    });

    useUpdateProfileMutationMock.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });

    useMyOrdersQueryMock.mockReturnValue({
      data: { result: [], meta: { page: 1, pageSize: 100, pages: 1, total: 0 } },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    useMyAddressesQueryMock.mockReturnValue({
      data: { result: [], meta: { page: 1, pageSize: 100, pages: 1, total: 0 } },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    useSearchParamsMock.mockReturnValue({
      get: (param: string) => (param === "tab" ? "profile" : null),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("mặc định ở tab Account (profile) không kích hoạt cả ordersQuery lẫn addressesQuery", () => {
    render(<MemberProfile />);

    expect(useMyOrdersQueryMock).toHaveBeenCalledWith(
      1,
      { size: 100, sort: "createdAt,desc" },
      false
    );

    expect(useMyAddressesQueryMock).toHaveBeenCalledWith(
      1,
      { size: 100 },
      false
    );
  });

  it("khi chuyển sang tab Orders chỉ kích hoạt ordersQuery", () => {
    useSearchParamsMock.mockReturnValue({
      get: (param: string) => (param === "tab" ? "orders" : null),
    });

    render(<MemberProfile />);

    expect(useMyOrdersQueryMock).toHaveBeenCalledWith(
      1,
      { size: 100, sort: "createdAt,desc" },
      true
    );

    expect(useMyAddressesQueryMock).toHaveBeenCalledWith(
      1,
      { size: 100 },
      false
    );
  });

  it("khi chuyển sang sidebar panel Delivery chỉ kích hoạt addressesQuery", () => {
    useSearchParamsMock.mockReturnValue({
      get: (param: string) => (param === "tab" ? "profile" : null),
    });

    render(<MemberProfile />);

    const deliveryTabButton = screen.getByRole("button", { name: /account.sidebar.addresses/i });
    fireEvent.click(deliveryTabButton);

    expect(useMyAddressesQueryMock).toHaveBeenLastCalledWith(
      1,
      { size: 100 },
      true
    );

    expect(useMyOrdersQueryMock).toHaveBeenLastCalledWith(
      1,
      { size: 100, sort: "createdAt,desc" },
      false
    );
  });

  it("khi chưa đăng nhập thì không kích hoạt cả hai query", () => {
    useAuthMock.mockReturnValue({
      isAuthenticated: false,
      user: null,
      isLoading: false,
    });

    render(<MemberProfile />);

    expect(useMyOrdersQueryMock).toHaveBeenCalledWith(
      undefined,
      { size: 100, sort: "createdAt,desc" },
      false
    );

    expect(useMyAddressesQueryMock).toHaveBeenCalledWith(
      undefined,
      { size: 100 },
      false
    );
  });
});
