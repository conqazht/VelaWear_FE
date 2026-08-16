import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { StorefrontApiStatus } from "@/components/errors/storefront-api-status";
import { I18nProvider } from "@/components/providers/i18n-provider";

vi.mock("@/components/errors/status-code-rain", () => ({
  StatusCodeRain: ({ code }: { code: string }) => <div data-testid="status-code-rain">{code}</div>,
}));

function renderStatus(ui: React.ReactNode) {
  return render(<I18nProvider initialLocale="vi">{ui}</I18nProvider>);
}

describe("StorefrontApiStatus", () => {
  it("renders HTTP 400 as a contextual notice without retrying the invalid request", () => {
    const onRetry = vi.fn();

    renderStatus(
      <StorefrontApiStatus
        error={{ response: { status: 400 } }}
        onRetry={onRetry}
        resourceLabel="bộ sưu tập"
        recoveryAction={{ label: "Xem tất cả sản phẩm", href: "/collection" }}
        variant="route"
      />,
    );

    expect(screen.getByRole("heading", { name: "Kiểm tra lại thông tin" })).toBeInTheDocument();
    expect(screen.getByText("Vela Wear / HTTP 400")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Xem tất cả sản phẩm" })).toHaveAttribute(
      "href",
      "/collection",
    );
    expect(screen.queryByRole("button", { name: "Thử lại" })).not.toBeInTheDocument();
    expect(screen.queryByTestId("status-code-rain")).not.toBeInTheDocument();
  });

  it("keeps an exact 5xx code in the blocking artwork and allows retry", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    renderStatus(
      <StorefrontApiStatus
        error={{ response: { status: 502 } }}
        onRetry={onRetry}
        resourceLabel="bộ sưu tập"
        variant="route"
      />,
    );

    expect(screen.getByTestId("status-code-rain")).toHaveTextContent("502");
    await user.click(screen.getByRole("button", { name: "Thử lại" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
