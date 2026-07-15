"use client";

import { DollarSign, TrendingDown, TrendingUp, UserPlus, Users, Waves } from "lucide-react";

import { useI18n } from "@/components/providers/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getIntlLocale } from "@/lib/i18n";

export function MetricCards() {
  const { locale, t } = useI18n();
  const intlLocale = getIntlLocale(locale);
  const numberFormatter = new Intl.NumberFormat(intlLocale);
  const currencyFormatter = new Intl.NumberFormat(intlLocale, { currency: "USD", style: "currency" });
  const percentFormatter = new Intl.NumberFormat(intlLocale, {
    maximumFractionDigits: 1,
    signDisplay: "always",
    style: "percent",
  });

  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs xl:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex size-7 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
              <DollarSign className="size-4" />
            </div>
          </CardTitle>
          <CardDescription>{t("admin.dashboardsA.default.totalRevenue")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="font-medium text-3xl tabular-nums leading-none tracking-tight">
              {currencyFormatter.format(1250)}
            </div>
            <Badge>
              <TrendingUp className="size-3" />
              {percentFormatter.format(0.125)}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">{t("admin.dashboardsA.default.revenueNote")}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex size-7 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
              <UserPlus className="size-4" />
            </div>
          </CardTitle>
          <CardDescription>{t("admin.dashboardsA.default.newCustomers")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="font-medium text-3xl tabular-nums leading-none tracking-tight">
              {numberFormatter.format(1234)}
            </div>
            <Badge variant="destructive">
              <TrendingDown className="size-3" />
              {percentFormatter.format(-0.2)}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">{t("admin.dashboardsA.default.acquisitionNote")}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex size-7 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
              <Users className="size-4" />
            </div>
          </CardTitle>
          <CardDescription>{t("admin.dashboardsA.default.activeAccounts")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="font-medium text-3xl tabular-nums leading-none tracking-tight">
              {numberFormatter.format(45_678)}
            </div>
            <Badge>
              <TrendingUp className="size-3" />
              {percentFormatter.format(0.125)}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">{t("admin.dashboardsA.default.engagementNote")}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex size-7 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
              <Waves className="size-4" />
            </div>
          </CardTitle>
          <CardDescription>{t("admin.dashboardsA.default.growthRate")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="font-medium text-3xl tabular-nums leading-none tracking-tight">
              {percentFormatter.format(0.045).replace(/^\+/, "")}
            </div>
            <Badge>
              <TrendingUp className="size-3" />
              {percentFormatter.format(0.045)}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">{t("admin.dashboardsA.default.growthNote")}</p>
        </CardContent>
      </Card>
    </div>
  );
}
