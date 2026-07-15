"use client";

import { ArrowDownRight, ArrowUpRight, Ellipsis } from "lucide-react";

import { useI18n } from "@/components/providers/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getIntlLocale } from "@/lib/i18n";

export function AnalyticsKpiStrip() {
  const { locale, t } = useI18n();
  const intlLocale = getIntlLocale(locale);
  const compactFormatter = new Intl.NumberFormat(intlLocale, { maximumFractionDigits: 1, notation: "compact" });
  const percentFormatter = new Intl.NumberFormat(intlLocale, {
    maximumFractionDigits: 1,
    style: "percent",
  });

  return (
    <div className="overflow-hidden rounded-xl bg-card shadow-xs ring-1 ring-foreground/10">
      <div className="grid divide-y *:data-[slot=card]:rounded-none *:data-[slot=card]:ring-0 md:grid-cols-2 md:divide-x md:divide-y-0 xl:grid-cols-5">
        <Card>
          <CardHeader>
            <CardTitle className="font-normal text-sm">{t("admin.dashboardsA.analytics.uniqueVisitors")}</CardTitle>
            <CardAction>
              <Ellipsis className="size-4" />
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <div className="text-2xl leading-none tracking-tight">{compactFormatter.format(213_100)}</div>
              <Badge className="bg-green-500/10 text-green-700 dark:bg-green-500/15 dark:text-green-300">
                <ArrowUpRight />
                {percentFormatter.format(0.028)}
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <span>
                {t("admin.dashboardsA.analytics.fromValue", {
                  value: compactFormatter.format(207_300),
                })}
              </span>
              <span>•</span>
              <span>{t("admin.dashboardsA.common.last4Weeks")}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-normal text-sm">{t("admin.dashboardsA.analytics.sessions")}</CardTitle>
            <CardAction>
              <Ellipsis className="size-4" />
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <div className="text-2xl leading-none tracking-tight">{compactFormatter.format(248_600)}</div>
              <Badge className="bg-green-500/10 text-green-700 dark:bg-green-500/15 dark:text-green-300">
                <ArrowUpRight />
                {percentFormatter.format(0.021)}
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <span>
                {t("admin.dashboardsA.analytics.fromValue", {
                  value: compactFormatter.format(243_500),
                })}
              </span>
              <span>•</span>
              <span>{t("admin.dashboardsA.common.last4Weeks")}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-normal text-sm">{t("admin.dashboardsA.analytics.pageviews")}</CardTitle>
            <CardAction>
              <Ellipsis className="size-4" />
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <div className="text-2xl leading-none tracking-tight">{compactFormatter.format(547_900)}</div>
              <Badge className="bg-destructive/10 text-destructive">
                <ArrowDownRight />
                {percentFormatter.format(0.033)}
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <span>
                {t("admin.dashboardsA.analytics.fromValue", {
                  value: compactFormatter.format(566_800),
                })}
              </span>
              <span>•</span>
              <span>{t("admin.dashboardsA.common.last4Weeks")}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-normal text-sm">{t("admin.dashboardsA.analytics.engagementRate")}</CardTitle>
            <CardAction>
              <Ellipsis className="size-4" />
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <div className="text-2xl leading-none tracking-tight">{percentFormatter.format(0.614)}</div>
              <Badge className="bg-green-500/10 text-green-700 dark:bg-green-500/15 dark:text-green-300">
                <ArrowUpRight />
                {percentFormatter.format(0.042)}
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <span>
                {t("admin.dashboardsA.analytics.fromValue", {
                  value: percentFormatter.format(0.589),
                })}
              </span>
              <span>•</span>
              <span>{t("admin.dashboardsA.common.last4Weeks")}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-normal text-sm">{t("admin.dashboardsA.analytics.conversionRate")}</CardTitle>
            <CardAction>
              <Ellipsis className="size-4" />
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <div className="text-2xl leading-none tracking-tight">{percentFormatter.format(0.084)}</div>
              <Badge className="bg-destructive/10 text-destructive">
                <ArrowDownRight />
                {percentFormatter.format(0.056)}
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <span>
                {t("admin.dashboardsA.analytics.fromValue", {
                  value: percentFormatter.format(0.089),
                })}
              </span>
              <span>•</span>
              <span>{t("admin.dashboardsA.common.last4Weeks")}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
