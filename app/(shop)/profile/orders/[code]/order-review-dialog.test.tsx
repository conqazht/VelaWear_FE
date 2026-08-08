import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { I18nProvider, I18nCatalogProvider } from "@/components/providers/i18n-provider";
import { shopMessages } from "@/lib/i18n/messages/catalog-shop";
import { OrderReviewDialog } from "./order-review-dialog";

const { mutateAsyncMock, resetMock } = vi.hoisted(() => ({
  mutateAsyncMock: vi.fn(),
  resetMock: vi.fn(),
}));

vi.mock("@/lib/queries/commerce", () => ({
  useCreateReviewMutation: () => ({
    mutateAsync: mutateAsyncMock,
    reset: resetMock,
    isPending: false,
    isError: true,
    error: new Error("Máy chủ tạm thời gián đoạn"),
  }),
}));

beforeAll(() => {
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    value: vi.fn(() => "blob:review-preview"),
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    configurable: true,
    value: vi.fn(),
  });
});

describe("OrderReviewDialog", () => {
  beforeEach(() => {
    mutateAsyncMock.mockReset();
    resetMock.mockReset();
    mutateAsyncMock.mockRejectedValue(new Error("Máy chủ tạm thời gián đoạn"));
  });

  it("gửi đúng orderItem/file và giữ form khi submit lỗi", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <I18nProvider initialLocale="vi">
        <I18nCatalogProvider messages={shopMessages}>
          <OrderReviewDialog
            open
            item={{
              id: 41,
              productName: "Áo linen",
              sku: "VELA-41",
              price: 950_000,
              quantity: 1,
              subtotal: 950_000,
              status: "COMPLETED",
            }}
            onOpenChange={onOpenChange}
          />
        </I18nCatalogProvider>
      </I18nProvider>,
    );
    const file = new File(["image"], "review.webp", { type: "image/webp" });

    await user.click(screen.getByRole("radio", { name: "5 sao" }));
    const textarea = screen.getByPlaceholderText(/Form dáng, chất liệu/);
    await user.type(textarea, "Form vừa vặn, chất liệu đẹp.");
    const input = document.querySelector<HTMLInputElement>('input[type="file"]');
    expect(input).not.toBeNull();
    await user.upload(input!, file);
    expect(await screen.findByAltText("Ảnh đánh giá đã chọn số 1")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Gửi đánh giá" }));

    expect(mutateAsyncMock).toHaveBeenCalledWith({
      orderItemId: 41,
      rating: 5,
      comment: "Form vừa vặn, chất liệu đẹp.",
      images: [file],
    });
    expect(textarea).toHaveValue("Form vừa vặn, chất liệu đẹp.");
    expect(screen.getByAltText("Ảnh đánh giá đã chọn số 1")).toBeInTheDocument();
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
