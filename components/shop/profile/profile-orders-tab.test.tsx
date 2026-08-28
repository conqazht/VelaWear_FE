import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProfileOrdersTab } from "./profile-orders-tab";
import type { Order } from "@/lib/api/types";

vi.mock("@/components/providers/i18n-provider", () => ({
  useI18n: () => ({
    locale: "vi",
    t: (key: string, params?: Record<string, unknown>) => {
      if (key === "account.orders.order") return `Order ${params?.code}`;
      if (key === "account.orders.count.one" || key === "account.orders.count.many") {
        return `${params?.count} orders placed`;
      }
      return key;
    },
  }),
}));

const mockOrders: Order[] = [
  {
    id: 1,
    orderCode: "ORD-PENDING-01",
    status: "PENDING",
    finalAmount: 150000,
    receiverName: "Nguyen Van A",
    receiverPhone: "0901234567",
    receiverAddress: "123 Le Loi, Da Nang",
    createdAt: "2026-08-01T10:00:00Z",
    items: [
      {
        id: 101,
        productName: "Linen Shirt",
        variantName: "White / L",
        sku: "LINEN-SHIRT-W-L",
        price: 150000,
        quantity: 1,
        subtotal: 150000,
        status: "PENDING",
      },
    ],
  },
  {
    id: 2,
    orderCode: "ORD-DELIVERED-02",
    status: "COMPLETED",
    finalAmount: 300000,
    receiverName: "Tran Thi B",
    receiverPhone: "0987654321",
    receiverAddress: "456 Nguyen Hue, HCM",
    createdAt: "2026-08-05T10:00:00Z",
    items: [
      {
        id: 102,
        productName: "Silk Dress",
        variantName: "Red / M",
        sku: "SILK-DRESS-R-M",
        price: 300000,
        quantity: 1,
        subtotal: 300000,
        status: "COMPLETED",
      },
    ],
  },
];

describe("ProfileOrdersTab - Filters and Search", () => {
  const dummyQuery = {
    data: { result: mockOrders },
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all orders initially", () => {
    render(<ProfileOrdersTab ordersQuery={dummyQuery} />);

    expect(screen.getByText("Order ORD-PENDING-01")).toBeInTheDocument();
    expect(screen.getByText("Order ORD-DELIVERED-02")).toBeInTheDocument();
  });

  it("filters orders when clicking a status tab", () => {
    render(<ProfileOrdersTab ordersQuery={dummyQuery} />);

    const pendingBtn = screen.getByRole("button", { name: "account.orders.status.pending" });
    fireEvent.click(pendingBtn);

    expect(screen.getByText("Order ORD-PENDING-01")).toBeInTheDocument();
    expect(screen.queryByText("Order ORD-DELIVERED-02")).not.toBeInTheDocument();

    const allBtn = screen.getByText("account.orders.filterAll");
    fireEvent.click(allBtn);

    expect(screen.getByText("Order ORD-PENDING-01")).toBeInTheDocument();
    expect(screen.getByText("Order ORD-DELIVERED-02")).toBeInTheDocument();
  });

  it("filters orders by search query across order code and product name", () => {
    render(<ProfileOrdersTab ordersQuery={dummyQuery} />);

    const searchInput = screen.getByPlaceholderText("account.orders.searchPlaceholder");

    // Search by product name
    fireEvent.change(searchInput, { target: { value: "Silk" } });
    expect(screen.queryByText("Order ORD-PENDING-01")).not.toBeInTheDocument();
    expect(screen.getByText("Order ORD-DELIVERED-02")).toBeInTheDocument();

    // Search by order code
    fireEvent.change(searchInput, { target: { value: "PENDING-01" } });
    expect(screen.getByText("Order ORD-PENDING-01")).toBeInTheDocument();
    expect(screen.queryByText("Order ORD-DELIVERED-02")).not.toBeInTheDocument();
  });

  it("shows empty state and clear button when no orders match", () => {
    render(<ProfileOrdersTab ordersQuery={dummyQuery} />);

    const searchInput = screen.getByPlaceholderText("account.orders.searchPlaceholder");
    fireEvent.change(searchInput, { target: { value: "non-existent-search" } });

    expect(screen.getByText("account.orders.noFilteredOrders")).toBeInTheDocument();
    const clearBtn = screen.getByRole("button", { name: "account.orders.clearFilter" });
    expect(clearBtn).toBeInTheDocument();

    fireEvent.click(clearBtn);
    expect(screen.getByText("Order ORD-PENDING-01")).toBeInTheDocument();
    expect(screen.getByText("Order ORD-DELIVERED-02")).toBeInTheDocument();
  });
});
