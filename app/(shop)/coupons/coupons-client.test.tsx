import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CouponsClient } from "./coupons-client";
import type { MyCoupons } from "@/lib/api/types";

const { useAuthMock, useMyCouponsQueryMock, useSearchParamsMock } = vi.hoisted(() => ({
  useAuthMock: vi.fn(),
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
      if (params && "amount" in params && "tier" in params)
        return `${key}:${params.amount}:${params.tier}`;
      if (params && "amount" in params) return `${key}:${params.amount}`;
      if (params && "code" in params) return `${key}:${params.code}`;
      if (params && "tier" in params) return `${key}:${params.tier}`;
      return key;
    },
  }),
}));

vi.mock("@/lib/queries/commerce", () => ({
  useMyCouponsQuery: (enabled: boolean) => useMyCouponsQueryMock(enabled),
}));

const mockMemberCouponsData: MyCoupons = {
  membershipTier: "SILVER",
  tierLabel: "Bạc",
  tierSpentAmount: 2500000,
  nextTier: "GOLD",
  nextTierLabel: "Vàng",
  amountToNextTier: 2500000,
  cycleDays: 180,
  availableCoupons: [
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
      minTier: "STANDARD",
    },
    {
      id: 2,
      code: "VIPSILVER10",
      type: "PERCENTAGE",
      value: 10,
      minOrderAmount: 300000,
      maxDiscount: 100000,
      usedCount: 1,
      usageLimit: 50,
      startDate: "2026-01-01T00:00:00Z",
      endDate: "2026-12-31T23:59:59Z",
      status: "ACTIVE",
      minTier: "SILVER",
    },
    {
      id: 3,
      code: "VIPDIAMOND20",
      type: "PERCENTAGE",
      value: 20,
      minOrderAmount: 1000000,
      maxDiscount: 300000,
      usedCount: 0,
      usageLimit: 10,
      startDate: "2026-01-01T00:00:00Z",
      endDate: "2026-12-31T23:59:59Z",
      status: "ACTIVE",
      minTier: "DIAMOND",
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

describe("CouponsClient Component - Member Gate & VIP Tiers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSearchParamsMock.mockReturnValue(new URLSearchParams());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders member lock gate with sign-in and register CTAs for unauthenticated visitors", () => {
    useAuthMock.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    useMyCouponsQueryMock.mockReturnValue({
      data: null,
      isLoading: false,
    });

    render(<CouponsClient />);

    expect(screen.getByText("coupons.lock.title")).toBeInTheDocument();
    expect(screen.getByText("coupons.lock.description")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /coupons\.lock\.signIn/i })).toHaveAttribute(
      "href",
      "/sign-in?redirect=%2Fcoupons",
    );
    expect(screen.getByRole("link", { name: /coupons\.lock\.register/i })).toHaveAttribute(
      "href",
      "/register",
    );
  });

  it("renders authenticated member's tier progress banner and statistics", () => {
    useAuthMock.mockReturnValue({
      user: { id: 10, email: "vip@example.com", fullName: "Vip User" },
      isAuthenticated: true,
      isLoading: false,
    });
    useMyCouponsQueryMock.mockReturnValue({
      data: mockMemberCouponsData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<CouponsClient />);

    expect(screen.getByText(/coupons\.tier\.current/i)).toBeInTheDocument();
    expect(screen.getByText(/coupons\.tier\.next/i)).toBeInTheDocument();
    expect(screen.getByText("coupons.stat.available")).toBeInTheDocument();
    expect(screen.getByText("coupons.stat.used")).toBeInTheDocument();
    expect(screen.getByText("coupons.stat.saved")).toBeInTheDocument();
  });

  it("allows eligible tier to copy code and marks higher tier as locked", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    useAuthMock.mockReturnValue({
      user: { id: 10, email: "vip@example.com", fullName: "Vip User" },
      isAuthenticated: true,
      isLoading: false,
    });
    useMyCouponsQueryMock.mockReturnValue({
      data: mockMemberCouponsData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<CouponsClient />);

    // User is SILVER: can copy WELCOME10 (STANDARD) and VIPSILVER10 (SILVER)
    expect(screen.getByText("WELCOME10")).toBeInTheDocument();
    expect(screen.getByText("VIPSILVER10")).toBeInTheDocument();

    // User is SILVER: VIPDIAMOND20 requires DIAMOND -> shows locked
    expect(screen.getByText("coupons.tier.locked:coupons.tier.diamond")).toBeInTheDocument();

    const copyButtons = screen.getAllByRole("button", { name: /coupons\.copyCode/i });
    expect(copyButtons.length).toBe(2);

    fireEvent.click(copyButtons[0]);
    expect(writeTextMock).toHaveBeenCalledWith("WELCOME10");
  });

  it("filters coupons by tab selection (VIP vs Storewide vs History)", () => {
    useAuthMock.mockReturnValue({
      user: { id: 10, email: "vip@example.com", fullName: "Vip User" },
      isAuthenticated: true,
      isLoading: false,
    });
    useMyCouponsQueryMock.mockReturnValue({
      data: mockMemberCouponsData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<CouponsClient />);

    // Click VIP tab
    const vipTab = screen.getByRole("tab", { name: /coupons\.tab\.vip/i });
    fireEvent.click(vipTab);

    expect(screen.getByText("VIPSILVER10")).toBeInTheDocument();
    expect(screen.getByText("VIPDIAMOND20")).toBeInTheDocument();
    expect(screen.queryByText("WELCOME10")).not.toBeInTheDocument();

    // Click History tab
    const historyTab = screen.getByRole("tab", { name: /coupons\.history/i });
    fireEvent.click(historyTab);

    expect(screen.getByText("ORD-999", { exact: false })).toBeInTheDocument();
  });
});
