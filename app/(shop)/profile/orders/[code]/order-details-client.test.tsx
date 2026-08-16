import type { ReactNode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getMyOrderByCodeMock, getMyOrderStatusHistoriesMock, useAuthMock } = vi.hoisted(() => ({
  getMyOrderByCodeMock: vi.fn(),
  getMyOrderStatusHistoriesMock: vi.fn(),
  useAuthMock: vi.fn(),
}));

vi.mock("@/components/auth/auth-provider", () => ({
  useAuth: useAuthMock,
}));

vi.mock("@/components/providers/i18n-provider", () => ({
  useI18n: () => ({
    locale: "vi",
    t: (key: string, params?: Record<string, unknown>) =>
      key === "account.order.code" ? `order:${String(params?.code)}` : key,
  }),
}));

vi.mock("@/components/errors/storefront-api-status", () => ({
  StorefrontApiStatus: ({ error }: { error: unknown }) => {
    const status = (error as { response?: { status?: number } }).response?.status;
    return <div data-testid="api-status" data-status={status ?? "unknown"} />;
  },
}));

vi.mock("@/lib/api/commerce", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/commerce")>();
  return {
    ...actual,
    getMyOrderByCode: getMyOrderByCodeMock,
    getMyOrderStatusHistories: getMyOrderStatusHistoriesMock,
  };
});

vi.mock("@/lib/queries/commerce", () => ({
  useMyReviewsQuery: () => ({
    data: { result: [] },
    error: null,
    isError: false,
    isLoading: false,
    refetch: vi.fn(),
  }),
}));

vi.mock("@/lib/checkout-api", () => ({
  cancelOrder: vi.fn(),
}));

vi.mock("./order-review-dialog", () => ({
  OrderReviewDialog: () => null,
}));

import { queryKeys } from "@/lib/queries/keys";
import OrderDetailsClient from "./order-details-client";

const historyParams = { size: 100, sort: "createdAt,asc" } as const;

function orderFor(accountId: number) {
  return {
    id: accountId * 10,
    orderCode: `ORDER-${accountId}`,
    status: "PENDING",
    paymentStatus: "UNPAID",
    paymentMethod: "COD",
    createdAt: "2026-07-16T10:00:00Z",
    items: [],
    subtotal: 0,
    shippingFee: 0,
    discountAmount: 0,
    finalAmount: 0,
    receiverName: "Customer",
    receiverPhone: "0900000000",
    receiverAddress: "Self-service Street",
  };
}

function createHarness() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  return { queryClient, Wrapper };
}

describe("OrderDetailsClient self-service contract", () => {
  beforeEach(() => {
    useAuthMock.mockReset().mockReturnValue({
      user: { id: 11 },
      isAuthenticated: true,
      isLoading: false,
    });
    getMyOrderByCodeMock.mockReset().mockResolvedValue(orderFor(11));
    getMyOrderStatusHistoriesMock.mockReset().mockResolvedValue({
      meta: { page: 1, pageSize: 100, pages: 1, total: 0 },
      result: [],
    });
  });

  it("loads detail and histories only through account-scoped self helpers and keys", async () => {
    const { queryClient, Wrapper } = createHarness();
    render(<OrderDetailsClient code="ORDER-11" />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(getMyOrderByCodeMock).toHaveBeenCalledWith("ORDER-11");
      expect(getMyOrderStatusHistoriesMock).toHaveBeenCalledWith(110, historyParams);
    });
    expect(queryClient.getQueryState(queryKeys.orders.meByCode(11, "ORDER-11"))).toBeDefined();
    expect(
      queryClient.getQueryState(queryKeys.orders.meStatusHistories(11, 110, historyParams)),
    ).toBeDefined();
  });

  it("does not reuse one account's detail cache after an account transition", async () => {
    getMyOrderByCodeMock.mockResolvedValueOnce(orderFor(11)).mockResolvedValueOnce(orderFor(22));
    const { queryClient, Wrapper } = createHarness();
    const view = render(<OrderDetailsClient code="SHARED-CODE" />, {
      wrapper: Wrapper,
    });
    expect(await screen.findByText("order:ORDER-11")).toBeInTheDocument();
    expect(getMyOrderByCodeMock).toHaveBeenCalledTimes(1);

    useAuthMock.mockReturnValue({
      user: { id: 22 },
      isAuthenticated: true,
      isLoading: false,
    });
    view.rerender(<OrderDetailsClient code="SHARED-CODE" />);

    expect(await screen.findByText("order:ORDER-22")).toBeInTheDocument();
    expect(screen.queryByText("order:ORDER-11")).not.toBeInTheDocument();
    expect(getMyOrderByCodeMock).toHaveBeenCalledTimes(2);
    expect(queryClient.getQueryState(queryKeys.orders.meByCode(11, "SHARED-CODE"))).toBeDefined();
    expect(queryClient.getQueryState(queryKeys.orders.meByCode(22, "SHARED-CODE"))).toBeDefined();
  });

  it("keeps guest requests disabled", async () => {
    useAuthMock.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    const { Wrapper } = createHarness();
    render(<OrderDetailsClient code="ORDER-11" />, { wrapper: Wrapper });

    await screen.findByText("account.signIn.orderTitle");
    expect(getMyOrderByCodeMock).not.toHaveBeenCalled();
    expect(getMyOrderStatusHistoriesMock).not.toHaveBeenCalled();
  });

  it("propagates a self-detail 404 and never requests histories", async () => {
    getMyOrderByCodeMock.mockRejectedValue({ response: { status: 404 } });
    const { Wrapper } = createHarness();
    render(<OrderDetailsClient code="FOREIGN" />, { wrapper: Wrapper });

    const status = await screen.findByTestId("api-status");
    expect(status).toHaveAttribute("data-status", "404");
    expect(getMyOrderStatusHistoriesMock).not.toHaveBeenCalled();
  });
});
