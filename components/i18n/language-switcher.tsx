"use client";

import { useState } from "react";

import { Check, Languages } from "lucide-react";

import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const OPTIONS: Array<{ locale: Locale; shortLabel: string; nameKey: "language.english" | "language.vietnamese" }> = [
  { locale: "en", shortLabel: "EN", nameKey: "language.english" },
  { locale: "vi", shortLabel: "VI", nameKey: "language.vietnamese" },
];

export function LanguageSwitcher({
  className,
  inverted = false,
  presentation = "popover",
  showIcon = true,
}: {
  className?: string;
  inverted?: boolean;
  presentation?: "segmented" | "popover";
  showIcon?: boolean;
}) {
  const { locale, setLocale, t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const currentOption = OPTIONS.find((option) => option.locale === locale) ?? OPTIONS[1];

  if (presentation === "popover") {
    const currentLanguageName = t(currentOption.nameKey);

    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              size="icon"
              variant={inverted ? "ghost" : "outline"}
              aria-label={`${t("language.label")}: ${currentLanguageName}`}
              title={currentLanguageName}
              className={cn(
                "rounded-full",
                inverted &&
                  "border border-white/35 bg-black/10 text-white backdrop-blur-sm hover:bg-white/15 hover:text-white",
                className,
              )}
            />
          }
        >
          <Languages aria-hidden="true" />
        </PopoverTrigger>
        <PopoverContent align="end" className="w-52 gap-1 p-2">
          <PopoverTitle className="px-2 py-1 font-medium text-sm">{t("language.label")}</PopoverTitle>
          <div role="group" aria-label={t("language.label")} className="grid gap-1">
            {OPTIONS.map((option) => {
              const languageName = t(option.nameKey);
              const isActive = locale === option.locale;

              return (
                <Button
                  key={option.locale}
                  type="button"
                  aria-pressed={isActive}
                  autoFocus={isActive}
                  variant={isActive ? "secondary" : "ghost"}
                  onClick={() => {
                    setLocale(option.locale);
                    setIsOpen(false);
                  }}
                  className="w-full justify-start px-2"
                >
                  <span className="flex size-6 items-center justify-center rounded-md border bg-background text-[10px] font-semibold tracking-[0.12em]">
                    {option.shortLabel}
                  </span>
                  <span>{languageName}</span>
                  {isActive ? <Check aria-hidden="true" className="ml-auto" /> : null}
                </Button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    );
  }

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
