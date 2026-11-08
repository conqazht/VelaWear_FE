import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, beforeEach } from "vitest";

import { I18nProvider, I18nCatalogProvider } from "@/components/providers/i18n-provider";
import { shopMessages } from "@/lib/i18n/messages/catalog-shop";
import { GiftCustomizer } from "@/components/shop/gift-customizer";
import { setActiveLocale } from "@/lib/i18n";

describe("GiftCustomizer", () => {
  beforeEach(() => {
    setActiveLocale("vi");
    localStorage.clear();
  });

  it("renders collapsed initially", () => {
    render(
      <I18nProvider initialLocale="vi">
        <I18nCatalogProvider messages={shopMessages}>
          <GiftCustomizer />
        </I18nCatalogProvider>
      </I18nProvider>,
    );

    expect(screen.getByText("Đóng gói quà tặng & Thiệp viết tay")).toBeInTheDocument();
    expect(screen.queryByText("Lựa chọn hộp quà")).not.toBeInTheDocument();
  });

  it("expands gift options when checkbox is checked", async () => {
    const user = userEvent.setup();
    render(
      <I18nProvider initialLocale="vi">
        <I18nCatalogProvider messages={shopMessages}>
          <GiftCustomizer />
        </I18nCatalogProvider>
      </I18nProvider>,
    );

    const checkbox = screen.getByRole("checkbox", {
      name: /Đóng gói quà tặng & Thiệp viết tay/i,
    });
    await user.click(checkbox);

    expect(screen.getByText("Lựa chọn hộp quà")).toBeInTheDocument();
    expect(screen.getByText(/Hộp Signature Noir & Ruy Băng Vàng/)).toBeInTheDocument();
    expect(screen.getByText(/Hộp Botanical Eco Tái Sinh/)).toBeInTheDocument();
  });

  it("allows typing handwritten card message with preview", async () => {
    const user = userEvent.setup();
    render(
      <I18nProvider initialLocale="vi">
        <I18nCatalogProvider messages={shopMessages}>
          <GiftCustomizer />
        </I18nCatalogProvider>
      </I18nProvider>,
    );

    // Toggle open
    const mainCheckbox = screen.getByRole("checkbox", {
      name: /Đóng gói quà tặng & Thiệp viết tay/i,
    });
    await user.click(mainCheckbox);

    const messageInput = screen.getByPlaceholderText("Nhập lời chúc ý nghĩa của bạn tại đây...");
    await user.type(messageInput, "Chúc mừng sinh nhật!");

    expect(screen.getByText("Xem trước thiệp")).toBeInTheDocument();
    expect(screen.getAllByText(/Chúc mừng sinh nhật!/).length).toBeGreaterThanOrEqual(1);
  });
});
