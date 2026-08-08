import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ContentLocaleTabs } from "@/app/(admin)/dashboard/_components/management/content-locale-tabs";
import { I18nProvider, I18nCatalogProvider } from "@/components/providers/i18n-provider";
import { adminMessages } from "@/lib/i18n/messages/catalog-admin";
import type { Locale } from "@/lib/i18n";

function Harness({ onSave }: { onSave: () => void }) {
  const [locale, setLocale] = useState<Locale>("vi");
  return (
    <I18nProvider initialLocale="vi">
      <I18nCatalogProvider messages={adminMessages}>
        <ContentLocaleTabs
          value={locale}
          onValueChange={setLocale}
          complete={{ vi: true, en: false }}
        >
          {{
            vi: (
              <div>
                Nội dung tiếng Việt
                <button type="button" onClick={onSave}>Lưu</button>
              </div>
            ),
            en: <div>English content</div>,
          }}
        </ContentLocaleTabs>
      </I18nCatalogProvider>
    </I18nProvider>
  );
}

describe("ContentLocaleTabs", () => {
  it("shows VI/EN tabs and lets admin edit English independently", async () => {
    const user = userEvent.setup();
    render(<Harness onSave={() => undefined} />);

    expect(screen.getByText("Nội dung tiếng Việt")).toBeVisible();
    expect(screen.getByText(/English là tùy chọn/i)).toBeVisible();

    await user.click(screen.getByRole("tab", { name: /English/i }));

    expect(screen.getByText("English content")).toBeVisible();
  });

  it("warns about missing English without disabling the save action", async () => {
    const onSave = vi.fn();
    const user = userEvent.setup();
    render(<Harness onSave={onSave} />);

    expect(screen.getByText(/English là tùy chọn/i)).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Lưu" }));

    expect(onSave).toHaveBeenCalledOnce();
  });
});
