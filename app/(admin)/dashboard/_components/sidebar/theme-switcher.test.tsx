import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/fonts/registry", () => ({
  fontKeys: ["geist"] as const,
}));

import { ThemeSwitcher } from "@/app/(admin)/dashboard/_components/sidebar/theme-switcher";
import { I18nCatalogProvider, I18nProvider } from "@/components/providers/i18n-provider";
import { adminShellMessages } from "@/lib/i18n/messages/admin-shell";
import { PREFERENCE_DEFAULTS } from "@/lib/preferences/preferences-config";
import { PreferencesStoreProvider } from "@/stores/preferences/preferences-provider";

describe("ThemeSwitcher", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function renderWithPreferences(initialMode: "light" | "dark" = "light") {
    return render(
      <I18nProvider initialLocale="vi">
        <I18nCatalogProvider messages={adminShellMessages}>
          <PreferencesStoreProvider
            initialValues={{
              ...PREFERENCE_DEFAULTS,
              theme_mode: initialMode,
            }}
          >
            <ThemeSwitcher />
          </PreferencesStoreProvider>
        </I18nCatalogProvider>
      </I18nProvider>,
    );
  }

  it("renders button with outline variant and rounded-full styling", () => {
    renderWithPreferences("light");
    const button = screen.getByRole("button");

    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("rounded-full");
    expect(button).toHaveAttribute("aria-label");
  });

  it("toggles theme from light to dark when clicked in light mode", () => {
    renderWithPreferences("light");
    const button = screen.getByRole("button");

    fireEvent.click(button);

    expect(document.documentElement).toHaveAttribute("data-theme-mode", "dark");
  });

  it("toggles theme from dark to light when clicked in dark mode", () => {
    renderWithPreferences("dark");
    const button = screen.getByRole("button");

    fireEvent.click(button);

    expect(document.documentElement).toHaveAttribute("data-theme-mode", "light");
  });
});
