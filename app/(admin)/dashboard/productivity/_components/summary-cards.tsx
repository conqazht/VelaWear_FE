"use client";

import { ArrowRight, Clock3, Focus, TrendingUp } from "lucide-react";

import { useI18n } from "@/components/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/i18n/format";

export function SummaryCards() {
  const { locale, t } = useI18n();
  const summaryCards = [
    {
      title: t("admin.productivity.summary.today"),
      value: formatNumber(4, locale),
      description: t("admin.productivity.summary.tasksScheduled"),
      icon: Clock3,
    },
    {
      title: t("admin.productivity.summary.week"),
      value: formatNumber(0.68, locale, { style: "percent" }),
      description: t("admin.productivity.summary.progress"),
      icon: TrendingUp,
    },
    {
      title: t("admin.productivity.summary.focus"),
      value: t("admin.productivity.summary.deepWork"),
      description: t("admin.productivity.summary.hoursRemaining", { hours: 2 }),
      icon: Focus,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {summaryCards.map((item) => (
        <Card key={item.title} className="shadow-xs">
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <div className="grid size-7 place-items-center rounded-lg border bg-muted">
                  <item.icon className="size-4" />
                </div>
                {item.title}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div className="text-2xl leading-none tracking-tight">{item.value}</div>
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground tabular-nums leading-none">{item.description}</p>
                <ArrowRight className="size-4 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
