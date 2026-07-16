import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { I18nProvider } from "@/components/providers/i18n-provider";
import { ReviewComment } from "@/components/shop/review-comment";

const longComment = "Một đánh giá đủ dài để vượt quá ngưỡng ba dòng. ".repeat(8);

describe("ReviewComment", () => {
  it("rút gọn bình luận dài và cho phép Xem thêm/Thu gọn", async () => {
    const user = userEvent.setup();
    render(
      <I18nProvider initialLocale="vi">
        <ReviewComment comment={longComment} clamp />
      </I18nProvider>,
    );

    const paragraph = screen.getByText(longComment.trim());
    expect(paragraph).toHaveClass("line-clamp-3");

    await user.click(screen.getByRole("button", { name: "Xem thêm" }));
    expect(paragraph).not.toHaveClass("line-clamp-3");
    expect(screen.getByRole("button", { name: "Thu gọn" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("không hiển thị nút mở rộng cho bình luận ngắn", () => {
    render(
      <I18nProvider initialLocale="vi">
        <ReviewComment comment="Chất liệu đẹp." clamp />
      </I18nProvider>,
    );

    expect(screen.getByText("Chất liệu đẹp.")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
