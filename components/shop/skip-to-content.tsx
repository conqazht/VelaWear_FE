"use client";

import { useI18n } from "@/components/providers/i18n-provider";

export function SkipToContent() {
  const { t } = useI18n();

  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-5 focus:py-3 focus:bg-[#1c1a18] focus:text-[#f7f4ef] focus:rounded-sm focus:ring-2 focus:ring-[#b5573a] focus:ring-offset-2 focus:outline-none text-xs font-semibold uppercase tracking-widest shadow-2xl transition-all"
    >
      {t("common.skipToContent")}
    </a>
  );
}
