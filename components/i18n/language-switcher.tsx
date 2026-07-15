"use client";

import { Languages } from "lucide-react";

import { useI18n } from "@/components/providers/i18n-provider";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const OPTIONS: Array<{ locale: Locale; shortLabel: string; nameKey: "language.english" | "language.vietnamese" }> = [
  { locale: "en", shortLabel: "EN", nameKey: "language.english" },
  { locale: "vi", shortLabel: "VI", nameKey: "language.vietnamese" },
];

export function LanguageSwitcher({
  className,
  inverted = false,
  showIcon = true,
}: {
  className?: string;
  inverted?: boolean;
  showIcon?: boolean;
}) {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      role="group"
      aria-label={t("language.label")}
      className={cn(
        "inline-flex h-8 shrink-0 items-center gap-0.5 rounded-full border p-0.5 text-[10px] font-semibold tracking-[0.12em] transition-colors",
        inverted
          ? "border-white/35 bg-black/10 text-white backdrop-blur-sm"
          : "border-current/15 bg-background/75 text-foreground",
        className,
      )}
    >
      {showIcon ? <Languages aria-hidden="true" className="ml-1.5 size-3.5 opacity-70" /> : null}
      {OPTIONS.map((option) => {
        const languageName = t(option.nameKey);
        const isActive = locale === option.locale;

        return (
          <button
            key={option.locale}
            type="button"
            aria-pressed={isActive}
            aria-label={t("language.switchTo", { language: languageName })}
            title={languageName}
            onClick={() => setLocale(option.locale)}
            className={cn(
              "flex h-6 min-w-8 cursor-pointer items-center justify-center rounded-full px-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isActive && (inverted ? "bg-white text-[#1c1a18]" : "bg-foreground text-background"),
              !isActive && (inverted ? "hover:bg-white/15" : "hover:bg-foreground/10"),
            )}
          >
            {option.shortLabel}
          </button>
        );
      })}
    </div>
  );
}
