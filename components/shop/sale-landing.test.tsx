import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SaleLanding } from "@/components/shop/sale-landing";
import { I18nProvider } from "@/components/providers/i18n-provider";
import {
  LOCALE_STORAGE_KEY,
  setActiveLocale,
  type Locale,
} from "@/lib/i18n";

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

function renderSaleLanding(type: "STANDARD" | "FLASH", locale: Locale = "vi") {
  window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  setActiveLocale(locale);

  return render(
    <I18nProvider initialLocale={locale}>
      <SaleLanding type={type} />
    </I18nProvider>,
  );
}

describe("SaleLanding", () => {
  beforeEach(() => {
    window.localStorage.clear();
    setActiveLocale("vi");
    usePublicSalesQueryMock.mockReturnValue({
      data: { serverTime: "2026-07-15T00:00:00.000Z", campaigns: [] },
      isLoading: false,
      isError: false,
    });
  });

  it("giải thích rõ coupon cho Standard Sale", () => {
    renderSaleLanding("STANDARD");
    expect(screen.getByRole("heading", { name: "Sale" })).toBeInTheDocument();
    expect(screen.getByText(/Standard Sale vẫn có thể dùng coupon/i)).toBeInTheDocument();
  });

  it("cảnh báo thêm giỏ không giữ suất ở Flash Sale", () => {
    renderSaleLanding("FLASH");
    expect(screen.getByRole("heading", { name: "Flash Sale" })).toBeInTheDocument();
    expect(screen.getByText(/Thêm vào giỏ không đồng nghĩa với giữ suất/i)).toBeInTheDocument();
  });

  it("hiển thị nội dung Flash Sale bằng tiếng Anh", () => {
    renderSaleLanding("FLASH", "en");

    expect(screen.getByRole("heading", { name: "Flash Sale" })).toBeInTheDocument();
    expect(screen.getByText(/Adding an item to your bag does not reserve/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /View Standard Sale/i })).toHaveAttribute(
      "href",
      "/sale",
    );
    expect(usePublicSalesQueryMock).toHaveBeenCalledWith({
      type: "FLASH",
      locale: "en",
    });
    expect(document.title).toBe("Flash Sale | VELA WEAR");
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute(
      "content",
      "Discover limited-time, limited-quantity Flash Sale offers at VELA WEAR.",
    );
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

    renderSaleLanding("FLASH");

    expect(screen.getAllByText("Hết hàng")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Hết hàng" })).toBeDisabled();
    expect(screen.getByText(/Lượt mua còn lại.*checkout/i)).toBeInTheDocument();
  });
});
