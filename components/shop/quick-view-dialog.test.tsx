import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { I18nProvider, I18nCatalogProvider } from "@/components/providers/i18n-provider";
import { shopMessages } from "@/lib/i18n/messages/catalog-shop";
import { CartProvider } from "@/components/shop/cart-provider";
import { NotificationProvider } from "@/components/shop/notification-provider";
import { QuickViewDialog } from "@/components/shop/quick-view-dialog";
import { setActiveLocale } from "@/lib/i18n";
import type { Product } from "@/lib/vela-data";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/collection",
}));

vi.mock("@/components/auth/auth-provider", () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  }),
}));

const mockProduct: Product = {
  id: "blazer-01",
  name: "Tailored Linen Blazer",
  price: 2890000,
  originalPrice: 3200000,
  image: "/images/fixtures/products/linen-blazer/card.webp",
  category: "AO",
  badge: "NEW",
  color: "Black",
  size: "M",
  description: "Linen blazer",
  material: "100% Linen",
};

describe("QuickViewDialog", () => {
  beforeEach(() => {
    setActiveLocale("vi");
    localStorage.clear();
  });

  it("renders product name, price, and actions when open", () => {
    render(
      <I18nProvider initialLocale="vi">
        <I18nCatalogProvider messages={shopMessages}>
          <CartProvider>
            <NotificationProvider>
              <QuickViewDialog product={mockProduct} open={true} onOpenChange={vi.fn()} />
            </NotificationProvider>
          </CartProvider>
        </I18nCatalogProvider>
      </I18nProvider>,
    );

    expect(screen.getByText("Tailored Linen Blazer")).toBeInTheDocument();
    expect(screen.getByText("Thêm vào giỏ")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /xem chi tiết đầy đủ/i })).toBeInTheDocument();
  });

  it("calls onOpenChange(false) when close button is clicked", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <I18nProvider initialLocale="vi">
        <I18nCatalogProvider messages={shopMessages}>
          <CartProvider>
            <NotificationProvider>
              <QuickViewDialog product={mockProduct} open={true} onOpenChange={onOpenChange} />
            </NotificationProvider>
          </CartProvider>
        </I18nCatalogProvider>
      </I18nProvider>,
    );

    const closeBtn = screen.getByRole("button", { name: /close/i });
    await user.click(closeBtn);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
