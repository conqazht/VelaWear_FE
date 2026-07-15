"use client";

import { useI18n } from "@/components/providers/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatNumber } from "@/lib/i18n/format";

export function OverviewKpis() {
  const { locale, t } = useI18n();
  const compactUsd = (value: number) =>
    formatNumber(value, locale, {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    });
  const percentage = (value: number) => formatNumber(value, locale, { style: "percent", maximumFractionDigits: 1 });

  return (
    <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
      <div className="grid grid-cols-1 xl:grid-cols-8">
        <Card className="gap-5 overflow-hidden rounded-none border-0 border-foreground/10 border-b ring-0 xl:col-span-4 xl:border-r">
          <CardHeader>
            <CardTitle className="font-normal">{t("admin.finance.kpi.netWorth")}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div className="space-y-1">
              <div className="font-heading text-3xl leading-none tracking-tight">{compactUsd(128400)}</div>
              <p className="text-muted-foreground text-xs">{t("admin.finance.kpi.netWorthComparison", { amount: `+${compactUsd(9800)}` })}</p>
            </div>
            <Badge className="bg-green-500/10 text-green-700 dark:bg-green-500/15 dark:text-green-300">+{percentage(0.084)}</Badge>
          </CardContent>
        </Card>

        <Card className="gap-5 overflow-hidden rounded-none border-0 border-foreground/10 border-b ring-0 xl:col-span-4">
          <CardHeader>
            <CardTitle className="font-normal">{t("admin.finance.kpi.availableCash")}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div className="flex flex-col gap-1">
              <div className="font-heading text-3xl leading-none tracking-tight">{compactUsd(12800)}</div>
              <p className="text-muted-foreground text-xs">{t("admin.finance.kpi.availableCashComparison", { amount: formatCurrency(410, locale, "USD") })}</p>
            </div>
            <Badge className="bg-green-500/10 text-green-700 dark:bg-green-500/15 dark:text-green-300">+{percentage(0.032)}</Badge>
          </CardContent>
        </Card>

        <Card className="gap-5 overflow-hidden rounded-none border-0 border-foreground/10 ring-0 xl:col-span-4 xl:border-r">
          <CardHeader>
            <CardTitle className="font-normal">{t("admin.finance.kpi.monthlySpend")}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div className="flex flex-col gap-1">
              <div className="font-heading text-3xl leading-none tracking-tight">{formatCurrency(2140, locale, "USD")}</div>
              <p className="text-muted-foreground text-xs">{t("admin.finance.kpi.monthlySpendComparison", { amount: formatCurrency(124, locale, "USD") })}</p>
            </div>
            <Badge variant="destructive" className="bg-destructive/10 text-destructive">
              +{percentage(0.061)}
            </Badge>
          </CardContent>
        </Card>

        <Card className="gap-5 overflow-hidden rounded-none border-0 ring-0 xl:col-span-4">
          <CardHeader>
            <CardTitle className="font-normal">{t("admin.finance.kpi.savingsRate")}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div className="flex flex-col gap-1">
              <div className="font-heading text-3xl leading-none tracking-tight">{percentage(0.28)}</div>
              <p className="text-muted-foreground text-xs">{t("admin.finance.kpi.savingsRateComparison", { rate: percentage(0.256) })}</p>
            </div>
            <Badge className="bg-green-500/10 text-green-700 dark:bg-green-500/15 dark:text-green-300">+{percentage(0.024)}</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
