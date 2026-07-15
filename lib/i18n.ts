export const SUPPORTED_LOCALES = ["en", "vi"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "vi";
export const LOCALE_STORAGE_KEY = "vela-locale";
export const LOCALE_COOKIE_KEY = "vela_locale";

let activeLocale: Locale = DEFAULT_LOCALE;
const localeListeners = new Set<() => void>();

export const LOCALE_BOOTSTRAP_SCRIPT = `
  (() => {
    let locale = null;
    try { locale = window.localStorage.getItem(${JSON.stringify(LOCALE_STORAGE_KEY)}); } catch {}
    if (locale !== "en" && locale !== "vi") {
      try {
        const match = document.cookie.match(new RegExp("(?:^|; )" + ${JSON.stringify(LOCALE_COOKIE_KEY)} + "=([^;]*)"));
        locale = match ? decodeURIComponent(match[1]) : null;
      } catch {}
    }
    if (locale === "en" || locale === "vi") {
      document.documentElement.lang = locale;
      document.documentElement.dataset.locale = locale;
    }
  })();
`.replace(/\s+/g, " ");

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && SUPPORTED_LOCALES.includes(value as Locale);
}

export function parseLocale(value: unknown): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/**
 * Returns the current client locale for non-React API helpers.
 * React components should use `useI18n()` so they rerender after a switch.
 */
export function getActiveLocale(): Locale {
  if (typeof document !== "undefined") {
    const documentLocale = document.documentElement.dataset.locale;
    if (isLocale(documentLocale)) activeLocale = documentLocale;
  }

  return activeLocale;
}

export function setActiveLocale(locale: Locale): void {
  activeLocale = locale;

  if (typeof document !== "undefined") {
    document.documentElement.lang = locale;
    document.documentElement.dataset.locale = locale;
  }

  // Notify even when the module snapshot already matches. Standalone surfaces
  // such as `global-error` can resolve their first locale from persistence
  // before this module has observed the document locale.
  localeListeners.forEach((listener) => listener());
}

export function subscribeToActiveLocale(listener: () => void): () => void {
  localeListeners.add(listener);
  return () => localeListeners.delete(listener);
}

export function getIntlLocale(locale: Locale): "en-US" | "vi-VN" {
  return locale === "vi" ? "vi-VN" : "en-US";
}
