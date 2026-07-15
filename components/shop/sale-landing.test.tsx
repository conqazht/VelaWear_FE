import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SaleLanding } from "@/components/shop/sale-landing";

const { usePublicSalesQueryMock } = vi.hoisted(() => ({
  usePublicSalesQueryMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>();
  return {
    ...actual,
    useQueryClient: () => ({ invalidateQueries: vi.fn() }),
  };
});

vi.mock("@/lib/queries/sales", () => ({
  saleQueryKeys: { root: ["sales"] },
  usePublicSalesQuery: usePublicSalesQueryMock,
}));

describe("SaleLanding", () => {
  beforeEach(() => {
    usePublicSalesQueryMock.mockReturnValue({
      data: { serverTime: "2026-07-15T00:00:00.000Z", campaigns: [] },
      isLoading: false,
      isError: false,
    });
  });

  it("giải thích rõ coupon cho Standard Sale", () => {
    render(<SaleLanding type="STANDARD" />);
    expect(screen.getByRole("heading", { name: "Sale" })).toBeInTheDocument();
    expect(screen.getByText(/Standard Sale vẫn có thể dùng coupon/i)).toBeInTheDocument();
  });

  it("cảnh báo thêm giỏ không giữ suất ở Flash Sale", () => {
    render(<SaleLanding type="FLASH" />);
    expect(screen.getByRole("heading", { name: "Flash Sale" })).toBeInTheDocument();
    expect(screen.getByText(/Thêm vào giỏ không đồng nghĩa với giữ suất/i)).toBeInTheDocument();
  });

  it("hiển thị hết hàng khi quota còn nhưng availableQuantity bằng 0", () => {
    usePublicSalesQueryMock.mockReturnValue({
      data: {
        serverTime: "2026-07-15T00:00:00.000Z",
        campaigns: [
          {
            id: 10,
            code: "FLASH-STOCK",
            name: "Flash còn quota nhưng hết stock",
            type: "FLASH",
            status: "PUBLISHED",
            phase: "LIVE",
            startsAt: "2026-07-14T00:00:00.000Z",
            endsAt: "2026-07-16T00:00:00.000Z",
            items: [
              {
                id: 11,
                variantId: 101,
                productId: 7,
                productName: "Áo linen",
                productSlug: "ao-linen",
                sku: "AO-S",
                referencePrice: 500_000,
                promotionalPrice: 400_000,
                stockQuantity: 0,
                availableQuantity: 0,
                quota: 5,
                reservedQuantity: 1,
                soldQuantity: 1,
                remainingQuota: 3,
                maxPerCustomer: 2,
              },
            ],
          },
        ],
      },
      isLoading: false,
      isError: false,
    });

    render(<SaleLanding type="FLASH" />);

    expect(screen.getAllByText("Hết hàng")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Hết hàng" })).toBeDisabled();
    expect(screen.getByText(/Lượt mua còn lại.*checkout/i)).toBeInTheDocument();
  });
});
