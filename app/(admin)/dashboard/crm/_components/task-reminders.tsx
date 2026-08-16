"use client";

import { CalendarDays, CalendarRange } from "lucide-react";

import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getIntlLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const proposalSent = 12;
const proposalGoal = 18;
const proposalProgressPercentage = Math.round((proposalSent / proposalGoal) * 100);
const proposalGoalBarCount = 42;
const activeProposalBars = Math.round((proposalSent / proposalGoal) * proposalGoalBarCount);

const proposalGoalBars = Array.from({ length: proposalGoalBarCount }, (_, index) => ({
  id: `proposal-goal-${index + 1}`,
  active: index < activeProposalBars,
}));

export function TaskReminders() {
  const { locale, t } = useI18n();
  const intlLocale = getIntlLocale(locale);
  const numberFormatter = new Intl.NumberFormat(intlLocale);
  const percentFormatter = new Intl.NumberFormat(intlLocale, { style: "percent" });
  const timeFormatter = new Intl.DateTimeFormat(intlLocale, { hour: "numeric", minute: "2-digit" });
  const formatTime = (value: string) => {
    const [hour, minute] = value.split(":").map(Number);
    return timeFormatter.format(new Date(2024, 0, 1, hour, minute));
  };

  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
      <Card className="xl:col-span-8">
        <CardHeader>
          <CardTitle>{t("admin.dashboardsA.crm.upcomingMeetings")}</CardTitle>
          <CardAction>
            <Button variant="outline" size="sm">
              <CalendarDays data-icon="inline-start" />
              {t("admin.dashboardsA.crm.viewCalendar")}
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="text-muted-foreground flex items-center justify-between text-xs tabular-nums">
              <div className="flex flex-col items-center gap-1">
                <span>{formatTime("08:45")}</span>
                <span className="bg-border h-2 w-px" />
              </div>
              <div className="flex flex-col items-center gap-1">
                <span>{formatTime("09:00")}</span>
                <span className="bg-border h-2 w-px" />
              </div>
              <div className="flex flex-col items-center gap-1">
                <span>{formatTime("10:00")}</span>
                <span className="bg-border h-2 w-px" />
              </div>
              <div className="flex flex-col items-center gap-1">
                <span>{formatTime("10:20")}</span>
                <span className="bg-border h-2 w-px" />
              </div>
            </div>

            <div className="relative h-14">
              <div className="bg-border/80 absolute inset-x-3 top-1/2 h-px -translate-y-1/2" />
              <div className="bg-primary text-primary-foreground absolute top-2 bottom-2 left-[22%] flex w-[44%] items-center rounded-lg px-2 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="bg-background text-primary flex size-7 items-center justify-center rounded-full">
                    <CalendarRange className="size-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-primary-foreground truncate text-xs leading-none font-medium">
                      {t("admin.dashboardsA.crm.productDemo", { name: "Tim" })}
                    </div>
                    <div className="text-primary-foreground/75 truncate text-[10px]">
                      Weblabs Studio
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-background/90 absolute top-4 bottom-4 left-[64%] w-1 rounded-full" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="xl:col-span-4">
        <CardHeader>
          <CardTitle>{t("admin.dashboardsA.crm.monthlyProposalGoal")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <div className="flex items-end justify-between gap-3">
            <div className="text-2xl leading-none font-medium tabular-nums">
              {numberFormatter.format(proposalSent)}{" "}
              <span className="text-muted-foreground text-base font-normal">
                {t("admin.dashboardsA.crm.sent")}
              </span>
            </div>
            <div className="text-muted-foreground text-sm tabular-nums">
              {t("admin.dashboardsA.crm.target", { count: numberFormatter.format(proposalGoal) })}
            </div>
          </div>
          <div className="flex h-10 w-full items-end gap-0.5">
            {proposalGoalBars.map((bar) => (
              <div key={bar.id} className="flex flex-1 justify-center">
                <div
                  className={cn(
                    "h-10 w-1.5 rounded-full",
                    bar.active ? "bg-muted-foreground/75" : "bg-muted-foreground/25",
                  )}
                />
              </div>
            ))}
          </div>
          <p className="text-muted-foreground text-sm">
            {t("admin.dashboardsA.crm.proposalProgress", {
              percent: percentFormatter.format(proposalProgressPercentage / 100),
            })}
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
