"use client";

import { ArrowUpRight, TrendingDown, TrendingUp } from "lucide-react";

import { useI18n } from "@/components/providers/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { getIntlLocale } from "@/lib/i18n";

export function KpiCards() {
  const { locale, t } = useI18n();
  const intlLocale = getIntlLocale(locale);
  const currencyFormatter = new Intl.NumberFormat(intlLocale, {
    currency: "USD",
    maximumFractionDigits: 0,
    style: "currency",
  });
  const numberFormatter = new Intl.NumberFormat(intlLocale);
  const percentFormatter = new Intl.NumberFormat(intlLocale, {
    maximumFractionDigits: 1,
    style: "percent",
  });
  const signedPercentFormatter = new Intl.NumberFormat(intlLocale, {
    maximumFractionDigits: 1,
    signDisplay: "always",
    style: "percent",
  });

  return (
    <section className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-3xl tracking-tight">{t("admin.dashboardsA.crm.pipelineOverview")}</h2>
        <p className="text-muted-foreground text-sm">
          {t("admin.dashboardsA.crm.pipelineDescription")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>{t("admin.dashboardsA.crm.leadPipelineValue")}</CardDescription>
            <CardAction>
              <ArrowUpRight className="size-4" />
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl leading-none tracking-tight">
                {currencyFormatter.format(284_500)}
              </span>

              <Badge
                variant="outline"
                className="border-green-200 bg-green-500/10 text-green-700 dark:border-green-900/40 dark:bg-green-500/15 dark:text-green-300"
              >
                <TrendingUp />
                {signedPercentFormatter.format(0.12)}
              </Badge>
            </div>
            <p className="text-sm">
              <span className="text-foreground font-medium">
                {currencyFormatter.format(254_200)}
              </span>{" "}
              <span className="text-muted-foreground">{t("admin.dashboardsA.crm.lastMonth")}</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>{t("admin.dashboardsA.crm.qualifiedLeadRate")}</CardDescription>
            <CardAction>
              <ArrowUpRight className="size-4" />
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl leading-none tracking-tight">
                {percentFormatter.format(0.284)}
              </span>

              <Badge
                variant="outline"
                className="border-destructive/20 bg-destructive/10 text-destructive"
              >
                <TrendingDown />
                {signedPercentFormatter.format(-0.025)}
              </Badge>
            </div>
            <p className="text-sm">
              <span className="text-foreground font-medium">{percentFormatter.format(0.309)}</span>{" "}
              <span className="text-muted-foreground">{t("admin.dashboardsA.crm.lastMonth")}</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>{t("admin.dashboardsA.crm.openOpportunities")}</CardDescription>
            <CardAction>
              <ArrowUpRight className="size-4" />
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl leading-none tracking-tight">
                {numberFormatter.format(42)}
              </span>

              <Badge
                variant="outline"
                className="border-green-200 bg-green-500/10 text-green-700 dark:border-green-900/40 dark:bg-green-500/15 dark:text-green-300"
              >
                <TrendingUp />+{numberFormatter.format(7)}
              </Badge>
            </div>
            <p className="text-sm">
              <span className="text-foreground font-medium">{numberFormatter.format(35)}</span>{" "}
              <span className="text-muted-foreground">{t("admin.dashboardsA.crm.lastMonth")}</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>{t("admin.dashboardsA.crm.leadToDealRate")}</CardDescription>
            <CardAction>
              <ArrowUpRight className="size-4" />
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl leading-none tracking-tight">
                {percentFormatter.format(0.181)}
              </span>

              <Badge
                variant="outline"
                className="border-green-200 bg-green-500/10 text-green-700 dark:border-green-900/40 dark:bg-green-500/15 dark:text-green-300"
              >
                <TrendingUp />
                {signedPercentFormatter.format(0.016)}
              </Badge>
            </div>
            <p className="text-sm">
              <span className="text-foreground font-medium">{percentFormatter.format(0.165)}</span>{" "}
              <span className="text-muted-foreground">{t("admin.dashboardsA.crm.lastMonth")}</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
