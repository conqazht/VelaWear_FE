"use client";

import { Quote } from "lucide-react";

import { useI18n } from "@/components/providers/i18n-provider";

export function QuoteCard() {
  const { t } = useI18n();

  return (
    <section className="bg-card rounded-2xl border p-6 shadow-xs">
      <div className="flex items-start gap-4">
        <div className="text-muted-foreground grid size-8 shrink-0 place-items-center">
          <Quote className="size-6" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-xl leading-none tracking-tight">
            {t("admin.productivity.quote.primary")}
          </p>
          <p className="text-muted-foreground">{t("admin.productivity.quote.secondary")}</p>
        </div>
      </div>
    </section>
  );
}
