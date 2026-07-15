"use client";

import { Quote } from "lucide-react";

import { useI18n } from "@/components/providers/i18n-provider";

export function QuoteCard() {
  const { t } = useI18n();

  return (
    <section className="rounded-2xl border bg-card p-6 shadow-xs">
      <div className="flex items-start gap-4">
        <div className="grid size-8 shrink-0 place-items-center text-muted-foreground">
          <Quote className="size-6" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-xl leading-none tracking-tight">{t("admin.productivity.quote.primary")}</p>
          <p className="text-muted-foreground">{t("admin.productivity.quote.secondary")}</p>
        </div>
      </div>
    </section>
  );
}
