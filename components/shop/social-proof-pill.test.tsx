import { render, screen } from "@testing-library/react";
import { describe, expect, it, beforeEach } from "vitest";

import { I18nProvider, I18nCatalogProvider } from "@/components/providers/i18n-provider";
import { shopMessages } from "@/lib/i18n/messages/catalog-shop";
import { SocialProofPill } from "@/components/shop/social-proof-pill";
import { setActiveLocale } from "@/lib/i18n";

describe("SocialProofPill", () => {
  beforeEach(() => {
    setActiveLocale("vi");
    localStorage.clear();
  });

  it("renders live viewer count correctly in Vietnamese", () => {
    render(
      <I18nProvider initialLocale="vi">
        <I18nCatalogProvider messages={shopMessages}>
          <SocialProofPill productId="prod-123" />
        </I18nCatalogProvider>
      </I18nProvider>,
    );

    expect(screen.getByText(/người đang xem sản phẩm này/)).toBeInTheDocument();
  });

  it("renders low stock badge when stockQuantity is low", () => {
    render(
      <I18nProvider initialLocale="vi">
        <I18nCatalogProvider messages={shopMessages}>
          <SocialProofPill productId="prod-456" stockQuantity={2} />
        </I18nCatalogProvider>
      </I18nProvider>,
    );

    expect(screen.getByText(/Chỉ còn 2 chiếc trong kho/)).toBeInTheDocument();
  });

  it("does not render low stock badge when stockQuantity is abundant", () => {
    render(
      <I18nProvider initialLocale="vi">
        <I18nCatalogProvider messages={shopMessages}>
          <SocialProofPill productId="prod-789" stockQuantity={25} />
        </I18nCatalogProvider>
      </I18nProvider>,
    );

    expect(screen.queryByText(/Chỉ còn/)).not.toBeInTheDocument();
  });
});
