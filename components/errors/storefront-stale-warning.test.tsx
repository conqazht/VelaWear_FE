import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { StorefrontStaleWarning } from "@/components/errors/storefront-stale-warning";
import { I18nProvider } from "@/components/providers/i18n-provider";

function renderWarning(error: unknown) {
  return render(
    <I18nProvider initialLocale="vi">
      <StorefrontStaleWarning error={error} onRetry={vi.fn()} resourceLabel="bộ sưu tập" />
    </I18nProvider>,
  );
}

describe("StorefrontStaleWarning", () => {
  it("keeps a deterministic HTTP 400 secondary and does not retry it", () => {
    renderWarning({ response: { status: 400 } });

    expect(screen.getByRole("status")).toHaveTextContent("HTTP 400");
    expect(screen.getByRole("status")).toHaveTextContent("không hợp lệ");
    expect(screen.queryByRole("button", { name: "Thử lại" })).not.toBeInTheDocument();
  });

  it("shows the exact retryable 5xx code with a retry action", () => {
    renderWarning({ response: { status: 504 } });

    expect(screen.getByRole("status")).toHaveTextContent("HTTP 504");
    expect(screen.getByRole("button", { name: "Thử lại" })).toBeInTheDocument();
  });
});
