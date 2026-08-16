"use client";

import { useI18n } from "@/components/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/i18n/format";

export function IncomeBreakdown() {
  const { locale, t } = useI18n();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-normal">{t("admin.finance.income.title")}</CardTitle>
      </CardHeader>

      <CardContent className="grid grid-cols-1 gap-1 md:grid-cols-3">
        <section className="isolate flex gap-[0.5px]">
          <Separator
            orientation="vertical"
            className="border-muted-foreground/50 mb-1 h-auto self-auto border-l border-dashed bg-transparent"
          />
          <div className="flex min-h-24 flex-1 flex-col justify-between">
            <div className="flex min-w-0 flex-col gap-1 px-1">
              <p className="text-muted-foreground text-xs leading-none wrap-break-word">
                {t("admin.finance.income.salary", { percentage: 68 })}
              </p>
              <div className="font-heading text-lg leading-none tracking-tight">
                {formatCurrency(4560, locale, "USD")}
              </div>
            </div>
            <div className="bg-chart-3 -ml-0.5 h-5 rounded-sm" />
          </div>
        </section>

        <section className="isolate flex gap-[0.5px]">
          <Separator
            orientation="vertical"
            className="border-muted-foreground/50 mb-1 h-auto self-auto border-l border-dashed bg-transparent"
          />
          <div className="flex min-h-24 flex-1 flex-col justify-between">
            <div className="flex min-w-0 flex-col gap-1 px-1">
              <p className="text-muted-foreground text-xs leading-none wrap-break-word">
                {t("admin.finance.income.freelance", { percentage: 21 })}
              </p>
              <div className="font-heading text-lg leading-none tracking-tight">
                {formatCurrency(1412, locale, "USD")}
              </div>
            </div>
            <div className="bg-chart-3/75 -ml-0.5 h-5 rounded-sm" />
          </div>
        </section>

        <section className="isolate flex gap-[0.5px]">
          <Separator
            orientation="vertical"
            className="border-muted-foreground/50 mb-1 h-auto self-auto border-l border-dashed bg-transparent"
          />
          <div className="flex min-h-24 flex-1 flex-col justify-between">
            <div className="flex min-w-0 flex-col gap-1 px-1">
              <p className="text-muted-foreground text-xs leading-none wrap-break-word">
                {t("admin.finance.income.dividends", { percentage: 11 })}
              </p>
              <div className="font-heading text-lg leading-none tracking-tight">
                {formatCurrency(765, locale, "USD")}
              </div>
            </div>
            <div className="bg-chart-3/50 -ml-0.5 h-5 rounded-sm" />
          </div>
        </section>
      </CardContent>
    </Card>
  );
}
