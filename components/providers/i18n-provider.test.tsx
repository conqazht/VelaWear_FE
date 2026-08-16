import { render, screen, act } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { I18nProvider, I18nCatalogProvider, useI18n } from "./i18n-provider";
import { shopMessages } from "@/lib/i18n/messages/catalog-shop";
import { adminMessages } from "@/lib/i18n/messages/catalog-admin";
import { LOCALE_STORAGE_KEY, setActiveLocale } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n/messages/types";

function TestConsumer({ translationKey }: { translationKey: string }) {
  const { locale, setLocale, t } = useI18n();
  return (
    <div>
      <span data-testid="locale">{locale}</span>
      <span data-testid="translated">{t(translationKey as TranslationKey)}</span>
      <button data-testid="switch-en" onClick={() => setLocale("en")}>
        EN
      </button>
      <button data-testid="switch-vi" onClick={() => setLocale("vi")}>
        VI
      </button>
    </div>
  );
}

describe("I18nProvider and I18nCatalogProvider", () => {
  beforeEach(() => {
    setActiveLocale("vi");
    window.localStorage.clear();
  });

  it("renders core translation and raw key fallback", () => {
    render(
      <I18nProvider initialLocale="vi">
        <TestConsumer translationKey="errors.api.forbiddenTitle" />
      </I18nProvider>,
    );

    expect(screen.getByTestId("locale").textContent).toBe("vi");
    expect(screen.getByTestId("translated").textContent).toBeTruthy();
  });

  it("overlays shop catalog via I18nCatalogProvider", () => {
    render(
      <I18nProvider initialLocale="vi">
        <I18nCatalogProvider messages={shopMessages}>
          <TestConsumer translationKey="account.tabs.profile" />
        </I18nCatalogProvider>
      </I18nProvider>,
    );

    expect(screen.getByTestId("translated").textContent).toBe("Hồ sơ");
  });

  it("overlays admin catalog via I18nCatalogProvider", () => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, "en");
    setActiveLocale("en");
    render(
      <I18nProvider initialLocale="en">
        <I18nCatalogProvider messages={adminMessages}>
          <TestConsumer translationKey="admin.shell.brand" />
        </I18nCatalogProvider>
      </I18nProvider>,
    );

    expect(screen.getByTestId("translated").textContent).toBe("Vela Wear Admin");
  });

  it("allows locale switching across catalog boundaries", () => {
    render(
      <I18nProvider initialLocale="vi">
        <I18nCatalogProvider messages={shopMessages}>
          <TestConsumer translationKey="account.tabs.profile" />
        </I18nCatalogProvider>
      </I18nProvider>,
    );

    expect(screen.getByTestId("translated").textContent).toBe("Hồ sơ");

    act(() => {
      screen.getByTestId("switch-en").click();
    });

    expect(screen.getByTestId("locale").textContent).toBe("en");
    expect(screen.getByTestId("translated").textContent).toBe("Profile");
  });
});
