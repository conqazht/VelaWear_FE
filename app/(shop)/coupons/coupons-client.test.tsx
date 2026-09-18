import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CouponsClient } from "./coupons-client";
import type { Coupon, MyCoupons } from "@/lib/api/types";

const { useAuthMock, useInfiniteCouponsQueryMock, useMyCouponsQueryMock, useSearchParamsMock } =
  vi.hoisted(() => ({
    useAuthMock: vi.fn(),
    useInfiniteCouponsQueryMock: vi.fn(),
    useMyCouponsQueryMock: vi.fn(),
    useSearchParamsMock: vi.fn(),
  }));

vi.mock("next/navigation", () => ({
  useSearchParams: () => useSearchParamsMock(),
}));

vi.mock("@/components/auth/auth-provider", () => ({
  useAuth: useAuthMock,
}));

vi.mock("@/components/providers/i18n-provider", () => ({
  useI18n: () => ({
    locale: "vi",
    t: (key: string, params?: Record<string, unknown>) => {
      if (params && "count" in params) return `${key}:${params.count}`;
      if (params && "amount" in params) return `${key}:${params.amount}`;
      if (params && "code" in params) return `${key}:${params.code}`;
      if (params && "percentage" in params) return `${key}:${params.percentage}`;
      return key;
    },
  }),
}));

vi.mock("@/lib/queries/commerce", () => ({
  useInfiniteCouponsQuery: (params: unknown) => useInfiniteCouponsQueryMock(params),
  useMyCouponsQuery: (enabled: boolean) => useMyCouponsQueryMock(enabled),
}));

const mockPublicCoupons: Coupon[] = [
  {
    id: 1,
    code: "WELCOME10",
    type: "PERCENTAGE",
    value: 10,
    minOrderAmount: 200000,
    maxDiscount: 50000,
    usedCount: 5,
    usageLimit: 100,
    startDate: "2026-01-01T00:00:00Z",
    endDate: "2026-12-31T23:59:59Z",
    status: "ACTIVE",
  },
  {
    id: 2,
    code: "FREESHIP",
    type: "FIXED_AMOUNT",
    value: 30000,
    minOrderAmount: 300000,
    maxDiscount: null,
    usedCount: 10,
    usageLimit: null,
    startDate: "2026-01-01T00:00:00Z",
    endDate: null,
    status: "ACTIVE",
  },
];

const mockMyCouponsData: MyCoupons = {
  availableCoupons: [
    {
      id: 3,
      code: "VIPMEMBER20",
      type: "PERCENTAGE",
      value: 20,
      minOrderAmount: 500000,
      maxDiscount: 100000,
      usedCount: 0,
      usageLimit: 1,
      startDate: "2026-01-01T00:00:00Z",
      endDate: "2026-12-31T23:59:59Z",
      status: "ACTIVE",
    },
  ],
  usageHistory: [
    {
      id: 101,
      coupon: {
        id: 1,
        code: "WELCOME10",
        type: "PERCENTAGE",
        value: 10,
        usedCount: 1,
        status: "ACTIVE",
      },
      orderId: 999,
      orderCode: "ORD-999",
      discountAmount: 50000,
      usedAt: "2026-02-15T10:30:00Z",
    },
  ],
};

describe("CouponsClient Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSearchParamsMock.mockReturnValue(new URLSearchParams());
    useAuthMock.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    useInfiniteCouponsQueryMock.mockReturnValue({
      data: {
        pages: [{ result: mockPublicCoupons, meta: { total: 2, page: 1, pages: 1 } }],
        pageParams: [1],
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: vi.fn(),
    });
    useMyCouponsQueryMock.mockReturnValue({
      data: { availableCoupons: [], usageHistory: [] },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders public storewide coupons and guest banner for unauthenticated visitors", () => {
    render(<CouponsClient />);

    expect(screen.getByRole("tab", { name: /coupons\.tab\.public/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /coupons\.tab\.my/i })).toBeInTheDocument();

    expect(screen.getByText("coupons.guestBanner.title")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /coupons\.guestBanner\.signIn/i })).toHaveAttribute(
      "href",
      "/sign-in?redirect=%2Fcoupons",
    );

    expect(screen.getByText("WELCOME10")).toBeInTheDocument();
    expect(screen.getByText("FREESHIP")).toBeInTheDocument();
  });

  it("displays accurate total count from meta.total", () => {
    useInfiniteCouponsQueryMock.mockReturnValue({
      data: {
        pages: [{ result: mockPublicCoupons, meta: { total: 58, page: 1, pages: 5 } }],
        pageParams: [1],
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
      hasNextPage: true,
      isFetchingNextPage: false,
      fetchNextPage: vi.fn(),
    });

    render(<CouponsClient />);

    expect(screen.getByText("coupons.publicCount:58")).toBeInTheDocument();
    expect(screen.getByText("58")).toBeInTheDocument();
  });

  it("copies coupon code to clipboard on copy button click", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(<CouponsClient />);

    const copyButtons = screen.getAllByRole("button", { name: /coupons\.copyCode/i });
    expect(copyButtons.length).toBeGreaterThan(0);

    fireEvent.click(copyButtons[0]);
    expect(writeTextMock).toHaveBeenCalledWith("WELCOME10");
  });

  it("prompts guest users to sign in when clicking the personal tab", () => {
    render(<CouponsClient />);

    const personalTab = screen.getByRole("tab", { name: /coupons\.tab\.my/i });
    fireEvent.click(personalTab);

    expect(screen.getByText("coupons.myTab.guestTitle")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /coupons\.myTab\.signIn/i })).toHaveAttribute(
      "href",
      "/sign-in?redirect=%2Fcoupons%3Ftab%3Dpersonal",
    );
  });

  it("renders authenticated member's voucher wallet, statistics, and usage history", () => {
    useAuthMock.mockReturnValue({
      user: { id: 10, email: "user@example.com", fullName: "Test User" },
      isAuthenticated: true,
      isLoading: false,
    });
    useMyCouponsQueryMock.mockReturnValue({
      data: mockMyCouponsData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<CouponsClient />);

    const personalTab = screen.getByRole("tab", { name: /coupons\.tab\.my/i });
    fireEvent.click(personalTab);

    expect(screen.getByText("coupons.stat.available")).toBeInTheDocument();
    expect(screen.getByText("coupons.stat.used")).toBeInTheDocument();
    expect(screen.getByText("coupons.stat.saved")).toBeInTheDocument();
    expect(screen.getByText("coupons.stat.expiring")).toBeInTheDocument();

    expect(screen.getByText("VIPMEMBER20")).toBeInTheDocument();
    expect(screen.getByText("ORD-999", { exact: false })).toBeInTheDocument();
  });

  it("renders empty state when there are no public coupons available", () => {
    useInfiniteCouponsQueryMock.mockReturnValue({
      data: {
        pages: [{ result: [], meta: { total: 0, page: 1, pages: 0 } }],
        pageParams: [1],
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: vi.fn(),
    });

    render(<CouponsClient />);

    expect(screen.getByText("coupons.publicEmpty")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "coupons.explore" })).toBeInTheDocument();
  });

  it("displays loading indicator when fetching next page", () => {
    useInfiniteCouponsQueryMock.mockReturnValue({
      data: {
        pages: [{ result: mockPublicCoupons, meta: { total: 10, page: 1, pages: 2 } }],
        pageParams: [1],
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
      hasNextPage: true,
      isFetchingNextPage: true,
      fetchNextPage: vi.fn(),
    });

    render(<CouponsClient />);

    expect(screen.getByText("coupons.loadingMore")).toBeInTheDocument();
  });

  it("respects initial ?tab=personal URL query param", () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams("tab=personal"));

    render(<CouponsClient />);

    expect(screen.getByRole("tab", { name: /coupons\.tab\.my/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByText("coupons.myTab.guestTitle")).toBeInTheDocument();
  });
});
