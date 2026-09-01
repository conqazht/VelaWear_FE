"use client";

import { useI18n } from "@/components/providers/i18n-provider";
import { AdminStatusBadge } from "@/app/(admin)/dashboard/_components/admin-status-badge";
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
  const percentage = (value: number) =>
    formatNumber(value, locale, { style: "percent", maximumFractionDigits: 1 });

  return (
    <div className="bg-card border-border overflow-hidden rounded-xl border shadow-[0_1px_2px_0_rgba(0,0,0,0.03)]">
      <div className="grid grid-cols-1 xl:grid-cols-8">
        <Card className="border-border gap-5 overflow-hidden rounded-none border-0 border-b xl:col-span-4 xl:border-r">
          <CardHeader>
            <CardTitle className="font-normal">{t("admin.finance.kpi.netWorth")}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div className="space-y-1">
              <div className="text-3xl font-bold tracking-tight tabular-nums">
                {compactUsd(128400)}
              </div>
              <p className="text-muted-foreground text-xs">
                {t("admin.finance.kpi.netWorthComparison", { amount: `+${compactUsd(9800)}` })}
              </p>
            </div>
            <AdminStatusBadge variant="success" size="sm">
              +{percentage(0.084)}
            </AdminStatusBadge>
          </CardContent>
        </Card>

        <Card className="border-border gap-5 overflow-hidden rounded-none border-0 border-b xl:col-span-4">
          <CardHeader>
            <CardTitle className="font-normal">{t("admin.finance.kpi.availableCash")}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div className="flex flex-col gap-1">
              <div className="text-3xl font-bold tracking-tight tabular-nums">
                {compactUsd(12800)}
              </div>
              <p className="text-muted-foreground text-xs">
                {t("admin.finance.kpi.availableCashComparison", {
                  amount: formatCurrency(410, locale, "USD"),
                })}
              </p>
            </div>
            <AdminStatusBadge variant="success" size="sm">
              +{percentage(0.032)}
            </AdminStatusBadge>
          </CardContent>
        </Card>

        <Card className="border-border gap-5 overflow-hidden rounded-none border-0 xl:col-span-4 xl:border-r">
          <CardHeader>
            <CardTitle className="font-normal">{t("admin.finance.kpi.monthlySpend")}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div className="flex flex-col gap-1">
              <div className="text-3xl font-bold tracking-tight tabular-nums">
                {formatCurrency(2140, locale, "USD")}
              </div>
              <p className="text-muted-foreground text-xs">
                {t("admin.finance.kpi.monthlySpendComparison", {
                  amount: formatCurrency(124, locale, "USD"),
                })}
              </p>
            </div>
            <AdminStatusBadge variant="danger" size="sm">
              +{percentage(0.061)}
            </AdminStatusBadge>
          </CardContent>
        </Card>

        <Card className="gap-5 overflow-hidden rounded-none border-0 xl:col-span-4">
          <CardHeader>
            <CardTitle className="font-normal">{t("admin.finance.kpi.savingsRate")}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div className="flex flex-col gap-1">
              <div className="text-3xl font-bold tracking-tight tabular-nums">
                {percentage(0.28)}
              </div>
              <p className="text-muted-foreground text-xs">
                {t("admin.finance.kpi.savingsRateComparison", { rate: percentage(0.256) })}
              </p>
            </div>
            <AdminStatusBadge variant="success" size="sm">
              +{percentage(0.024)}
            </AdminStatusBadge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
