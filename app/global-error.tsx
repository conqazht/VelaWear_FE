"use client";

import { useSyncExternalStore } from "react";

import { StorefrontStatus } from "@/components/errors/storefront-status";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_KEY,
  LOCALE_STORAGE_KEY,
  type Locale,
  isLocale,
  setActiveLocale,
  subscribeToActiveLocale,
} from "@/lib/i18n";
import { interpolateMessage } from "@/lib/i18n/define-messages";
import { authErrorMessages } from "@/lib/i18n/messages/auth-errors";
import { commonMessages } from "@/lib/i18n/messages/common";

import "./globals.css";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  const locale = useSyncExternalStore(
    subscribeToActiveLocale,
    readStandaloneLocale,
    () => DEFAULT_LOCALE,
  );

  const copy = authErrorMessages[locale];
  const commonCopy = commonMessages[locale];
  const referenceText = error.digest
    ? interpolateMessage(copy["errors.common.reference"], { reference: error.digest })
    : undefined;

  return (
    <html lang={locale} data-locale={locale} suppressHydrationWarning>
      <body>
        <title>500 — Vela Wear</title>
        <StorefrontStatus
          status={500}
          title={copy["errors.global.title"]}
          description={copy["errors.global.description"]}
          primaryAction={{ label: copy["errors.common.retry"], onClick: unstable_retry }}
          secondaryAction={{ label: copy["errors.common.home"], href: "/" }}
          reference={error.digest}
          standaloneCopy={{
            atelier: copy["errors.common.atelier"],
            editorial: copy["errors.common.editorial"],
            eyebrow: interpolateMessage(copy["errors.common.eyebrow"], { status: 500 }),
            rainHint: copy["errors.common.rainHint"],
            referenceText,
          }}
          headerAccessory={
            <div
              role="group"
              aria-label={commonCopy["language.label"]}
              className="inline-flex h-8 items-center gap-0.5 rounded-full border border-current/15 bg-white/75 p-0.5 text-[10px] font-semibold tracking-[0.12em]"
            >
              {(["en", "vi"] as const).map((option) => {
                const languageName =
                  commonCopy[option === "en" ? "language.english" : "language.vietnamese"];

                return (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={locale === option}
                    aria-label={interpolateMessage(commonCopy["language.switchTo"], {
                      language: languageName,
                    })}
                    title={languageName}
                    onClick={() => persistStandaloneLocale(option)}
                    className={`flex h-6 min-w-8 cursor-pointer items-center justify-center rounded-full px-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b5573a] ${
                      locale === option
                        ? "bg-[#1c1a18] text-[#f7f4ef]"
                        : "hover:bg-[#1c1a18]/10"
                    }`}
                  >
                    {option.toUpperCase()}
                  </button>
                );
              })}
            </div>
          }
        />
      </body>
    </html>
  );
}

function persistStandaloneLocale(locale: Locale): void {
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Keep the in-memory language switch working when storage is unavailable.
  }

  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${LOCALE_COOKIE_KEY}=${encodeURIComponent(locale)}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
  setActiveLocale(locale);
}

function readStandaloneLocale(): Locale {
  try {
    const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (isLocale(storedLocale)) return storedLocale;
  } catch {
    // Continue with the cookie fallback when storage is unavailable.
  }

  try {
    const cookieLocale = document.cookie
      .split("; ")
      .find((item) => item.startsWith(`${LOCALE_COOKIE_KEY}=`))
      ?.split("=")
      .slice(1)
      .join("=");
    const decodedLocale = cookieLocale ? decodeURIComponent(cookieLocale) : null;

    if (isLocale(decodedLocale)) return decodedLocale;
  } catch {
    // Fall through to the document locale when cookies are unavailable.
  }

  if (typeof document !== "undefined") {
    const documentLocale = document.documentElement.dataset.locale;
    if (isLocale(documentLocale)) return documentLocale;
  }

  return DEFAULT_LOCALE;
}
