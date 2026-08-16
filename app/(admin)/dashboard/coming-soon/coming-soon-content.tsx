"use client";

import { useI18n } from "@/components/providers/i18n-provider";

export function ComingSoonContent() {
  const { t } = useI18n();

  return (
    <div className="flex h-full flex-col items-center justify-center space-y-2 text-center">
      <h1 className="text-2xl font-semibold">{t("admin.workflows.comingSoon.title")}</h1>
      <p className="text-muted-foreground">{t("admin.workflows.comingSoon.description")}</p>
    </div>
  );
}
