import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { EnglishContentGenerator } from "@/app/(admin)/dashboard/_components/management/english-content-generator";
import { I18nProvider, I18nCatalogProvider } from "@/components/providers/i18n-provider";
import { adminMessages } from "@/lib/i18n/messages/catalog-admin";

function renderGenerator(
  props: Partial<React.ComponentProps<typeof EnglishContentGenerator>> = {},
) {
  const onGenerate = props.onGenerate ?? vi.fn();
  render(
    <I18nProvider initialLocale="vi">
      <I18nCatalogProvider messages={adminMessages}>
        <EnglishContentGenerator
          hasEnglishContent={false}
          sourceReady
          isPending={false}
          onGenerate={onGenerate}
          {...props}
        />
      </I18nCatalogProvider>
    </I18nProvider>,
  );
  return { onGenerate };
}

describe("EnglishContentGenerator", () => {
  it("uses Flash-Lite by default and does not submit an outer form", async () => {
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    const onGenerate = vi.fn();
    const user = userEvent.setup();
    render(
      <I18nProvider initialLocale="vi">
        <I18nCatalogProvider messages={adminMessages}>
          <form onSubmit={onSubmit}>
            <EnglishContentGenerator
              hasEnglishContent={false}
              sourceReady
              isPending={false}
              onGenerate={onGenerate}
            />
          </form>
        </I18nCatalogProvider>
      </I18nProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Tạo nội dung English" }));

    expect(onGenerate).toHaveBeenCalledWith("gemini-3.1-flash-lite");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("requires confirmation before replacing any existing English content", async () => {
    const onGenerate = vi.fn();
    const user = userEvent.setup();
    renderGenerator({ hasEnglishContent: true, onGenerate });

    await user.click(screen.getByRole("button", { name: "Tạo nội dung English" }));
    expect(onGenerate).not.toHaveBeenCalled();
    expect(screen.getByRole("alertdialog")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Thay và tạo lại" }));
    expect(onGenerate).toHaveBeenCalledOnce();
  });

  it("only allows a curated model option and forwards the selected ID", async () => {
    const onGenerate = vi.fn();
    const user = userEvent.setup();
    renderGenerator({ onGenerate });

    await user.click(screen.getByRole("combobox", { name: "Mô hình Gemini" }));
    await user.click(screen.getByText(/Gemini 3.5 Flash/i));
    await user.click(screen.getByRole("button", { name: "Tạo nội dung English" }));

    expect(onGenerate).toHaveBeenCalledWith("gemini-3.5-flash");
    expect(screen.queryByRole("textbox", { name: /model/i })).not.toBeInTheDocument();
  });

  it("stays disabled until the Vietnamese name is present", () => {
    renderGenerator({ sourceReady: false });

    expect(screen.getByRole("button", { name: "Tạo nội dung English" })).toBeDisabled();
    expect(screen.getByText(/Nhập tên tiếng Việt trước/i)).toBeVisible();
  });
});
