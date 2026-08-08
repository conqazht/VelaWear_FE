"use client";

import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_KEY,
  LOCALE_STORAGE_KEY,
  type Locale,
  getActiveLocale,
  isLocale,
  setActiveLocale,
  subscribeToActiveLocale,
} from "@/lib/i18n";
import {
  interpolateMessage,
  type MessageVariables,
} from "@/lib/i18n/define-messages";
import { coreMessages } from "@/lib/i18n/messages/catalog-core";
import type { TranslationKey } from "@/lib/i18n/messages/types";

export type MessageCatalog = {
  en: Record<string, string>;
  vi: Record<string, string>;
};

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, variables?: MessageVariables) => string;
  catalog: MessageCatalog;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function readCookieLocale(): Locale | null {
  try {
    const cookie = document.cookie
      .split("; ")
      .find((item) => item.startsWith(`${LOCALE_COOKIE_KEY}=`));
    const value = cookie ? decodeURIComponent(cookie.split("=").slice(1).join("=")) : null;
    return isLocale(value) ? value : null;
  } catch {
    return null;
  }
}

function readPersistedLocale(): Locale {
  try {
    const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (isLocale(storedLocale)) return storedLocale;
  } catch {
    // Storage can be disabled; the locale cookie remains the fallback.
  }

  return readCookieLocale() ?? DEFAULT_LOCALE;
}

function persistLocale(locale: Locale): void {
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // A blocked localStorage must not prevent the in-memory language switch.
  }

  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${LOCALE_COOKIE_KEY}=${encodeURIComponent(locale)}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
}

export function I18nProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const locale = useSyncExternalStore(
    subscribeToActiveLocale,
    getActiveLocale,
    () => initialLocale,
  );

  const applyLocale = useCallback((nextLocale: Locale, persist: boolean) => {
    setActiveLocale(nextLocale);
    if (persist) persistLocale(nextLocale);
  }, []);

  useEffect(() => {
    applyLocale(readPersistedLocale(), false);
  }, [applyLocale]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === LOCALE_STORAGE_KEY && isLocale(event.newValue)) {
        applyLocale(event.newValue, false);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [applyLocale]);

  const setLocale = useCallback(
    (nextLocale: Locale) => {
      applyLocale(nextLocale, true);
    },
    [applyLocale],
  );

  const catalog = coreMessages;

  const t = useCallback(
    (key: TranslationKey, variables?: MessageVariables) => {
      const message =
        catalog[locale][key as keyof typeof catalog[typeof locale]] ??
        catalog.en[key as keyof typeof catalog.en] ??
        key;
      return interpolateMessage(message, variables);
    },
    [locale, catalog],
  );

  const value = useMemo(
    () => ({ locale, setLocale, t, catalog }),
    [locale, setLocale, t, catalog],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function I18nCatalogProvider({
  messages,
  children,
}: {
  messages: MessageCatalog;
  children: React.ReactNode;
}) {
  const { locale, setLocale, catalog: parentCatalog } = useI18n();

  const mergedCatalog = useMemo<MessageCatalog>(() => {
    return {
      en: { ...parentCatalog.en, ...messages.en },
      vi: { ...parentCatalog.vi, ...messages.vi },
    };
  }, [parentCatalog, messages]);

  const t = useCallback(
    (key: TranslationKey, variables?: MessageVariables) => {
      const message =
        mergedCatalog[locale][key as keyof typeof mergedCatalog[typeof locale]] ??
        mergedCatalog.en[key as keyof typeof mergedCatalog.en] ??
        key;
      return interpolateMessage(message, variables);
    },
    [locale, mergedCatalog],
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      catalog: mergedCatalog,
    }),
    [locale, setLocale, t, mergedCatalog],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = use(I18nContext);
  if (!context) throw new Error("Missing I18nProvider");
  return context;
}
