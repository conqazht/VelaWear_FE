import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { I18nProvider } from "@/components/providers/i18n-provider";
import OrderDetailsClient from "./order-details-client";

const { getOrderByCodeMock, getOrderStatusHistoriesMock } = vi.hoisted(() => ({
  getOrderByCodeMock: vi.fn(),
  getOrderStatusHistoriesMock: vi.fn(),
}));

vi.mock("@/components/auth/auth-provider", () => ({
  useAuth: () => ({
    user: { id: 7 },
    isAuthenticated: true,
    isLoading: false,
  }),
}));

vi.mock("@/lib/api/commerce", () => ({
  getOrderByCode: getOrderByCodeMock,
  getOrderStatusHistories: getOrderStatusHistoriesMock,
}));

vi.mock("@/lib/queries/commerce", () => ({
  useMyReviewsQuery: () => ({
    data: undefined,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));

vi.mock("./order-review-dialog", () => ({
  OrderReviewDialog: () => null,
}));

function renderOrderDetails() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <I18nProvider initialLocale="vi">
        <OrderDetailsClient code="VELA-2026-001" />
      </I18nProvider>
    </QueryClientProvider>,
  );
}

describe("OrderDetailsClient", () => {
  beforeEach(() => {
    getOrderByCodeMock.mockReset();
    getOrderStatusHistoriesMock.mockReset();

    getOrderByCodeMock.mockResolvedValue({
      id: 41,
      userId: 7,
      orderCode: "VELA-2026-001",
      status: "CONFIRMED",
      subtotal: 950_000,
      shippingFee: 0,
      discountAmount: 0,
      finalAmount: 950_000,
      receiverName: "Nguyễn Văn Canh",
      receiverPhone: "0900000000",
      receiverAddress: "Thành phố Hồ Chí Minh",
      paymentMethod: "COD",
      paymentStatus: "UNPAID",
      createdAt: "2026-07-16T03:00:00.000Z",
      items: [],
    });
    getOrderStatusHistoriesMock.mockRejectedValue(
      Object.assign(new Error("Dịch vụ tạm thời gián đoạn"), {
        response: { status: 503 },
      }),
    );
  });

  it("keeps order details visible and contains a status-history 503 locally", async () => {
    const user = userEvent.setup();

    renderOrderDetails();

    expect(
      await screen.findByRole("heading", { name: "Chi tiết đơn hàng" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Mã đơn: VELA-2026-001")).toBeInTheDocument();
    expect(await screen.findByText("Đã tạo đơn hàng")).toBeInTheDocument();

    const warning = await screen.findByRole("status");
    expect(warning).toHaveTextContent("lịch sử trạng thái đơn hàng");
    expect(warning).toHaveTextContent("HTTP 503");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(getOrderStatusHistoriesMock).toHaveBeenCalledOnce();

    await user.click(screen.getByRole("button", { name: "Thử lại" }));

    await waitFor(() => {
      expect(getOrderStatusHistoriesMock).toHaveBeenCalledTimes(2);
    });
  });
});
