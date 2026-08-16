"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { useI18n } from "@/components/providers/i18n-provider";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getIntlLocale } from "@/lib/i18n";

const pipelineChartValues = [34, 38, 31, 47, 42, 51, 44, 40, 58, 46, 43, 49] as const;

function getRollingMonthData(values: readonly number[]) {
  return values.map((qualified, index) => {
    const date = new Date("2024-04-15T12:00:00Z");
    date.setMonth(date.getMonth() - (values.length - 1 - index));

    return {
      date: date.toISOString(),
      qualified,
    };
  });
}

export function PipelineActivity() {
  const { locale, t } = useI18n();
  const intlLocale = getIntlLocale(locale);
  const numberFormatter = new Intl.NumberFormat(intlLocale);
  const percentFormatter = new Intl.NumberFormat(intlLocale, { style: "percent" });
  const axisMonthFormatter = new Intl.DateTimeFormat(intlLocale, { month: "short" });
  const tooltipMonthFormatter = new Intl.DateTimeFormat(intlLocale, {
    month: "short",
    year: "2-digit",
  });
  const pipelineChartConfig = {
    qualified: {
      label: t("admin.dashboardsA.crm.qualified"),
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig;
  const pipelineRangeItems = [
    { value: "last-30-days", label: t("admin.dashboardsA.common.last30Days") },
    { value: "last-quarter", label: t("admin.dashboardsA.common.lastQuarter") },
    { value: "last-12-months", label: t("admin.dashboardsA.common.last12Months") },
  ] as const;
  const pipelineChartData = getRollingMonthData(pipelineChartValues);
  const totalQualified = pipelineChartData.reduce((sum, item) => sum + item.qualified, 0);
  const discoveryCallsBooked = 184;
  const discoveryProgress = Math.round((discoveryCallsBooked / totalQualified) * 100);

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
      <Card className="xl:col-span-12">
        <CardHeader>
          <CardTitle>{t("admin.dashboardsA.crm.qualifiedLeadFlow")}</CardTitle>
          <CardAction>
            <Select defaultValue="last-12-months" items={pipelineRangeItems}>
              <SelectTrigger size="sm" className="min-w-40">
                <SelectValue placeholder={t("admin.dashboardsA.common.selectRange")} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {pipelineRangeItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <ChartContainer config={pipelineChartConfig} className="h-72 w-full lg:col-span-8">
              <BarChart
                data={pipelineChartData}
                margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
                barSize={38}
              >
                <defs>
                  <pattern
                    id="crm-qualified-pattern"
                    width="4"
                    height="4"
                    patternUnits="userSpaceOnUse"
                    patternTransform="rotate(45)"
                  >
                    <rect width="6" height="6" fill="var(--color-qualified)" fillOpacity="0.15" />
                    <line
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="6"
                      stroke="var(--color-qualified)"
                      strokeWidth="1.25"
                      strokeOpacity="0.40"
                    />
                  </pattern>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="0" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => axisMonthFormatter.format(new Date(String(value)))}
                />
                <YAxis hide />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      hideIndicator
                      labelFormatter={(value) =>
                        tooltipMonthFormatter.format(new Date(String(value)))
                      }
                    />
                  }
                />
                <Bar
                  dataKey="qualified"
                  fill="url(#crm-qualified-pattern)"
                  radius={[8, 8, 0, 0]}
                  stroke="var(--color-qualified)"
                  strokeOpacity={0.5}
                  strokeWidth={0.5}
                />
              </BarChart>
            </ChartContainer>

            <div className="flex flex-col gap-5 rounded-lg p-4 lg:col-span-4">
              <div className="flex flex-col gap-1">
                <div className="text-4xl leading-none font-medium tabular-nums">
                  {numberFormatter.format(totalQualified)}{" "}
                  <span className="text-muted-foreground text-lg font-normal">
                    {t("admin.dashboardsA.crm.leads")}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm">
                  {t("admin.dashboardsA.crm.qualifiedLeadsDescription")}
                </p>
              </div>

              <div className="border-border/60 flex flex-col gap-3 rounded-lg border p-3">
                <div className="text-muted-foreground text-[11px] tracking-widest uppercase">
                  {t("admin.dashboardsA.crm.discoveryCalls")}
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="text-2xl leading-none font-medium tabular-nums">
                    {numberFormatter.format(discoveryCallsBooked)}{" "}
                    <span className="text-muted-foreground text-sm font-normal">
                      {t("admin.dashboardsA.crm.meetings")}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {t("admin.dashboardsA.crm.bookedLeadPercent", {
                      percent: percentFormatter.format(discoveryProgress / 100),
                    })}
                  </p>
                </div>

                <div className="flex flex-col gap-2 pt-0.5">
                  <Progress
                    value={discoveryProgress}
                    className="bg-chart-2/12 *:data-[slot='progress-indicator']:bg-chart-2 h-2.5"
                  />
                  <div className="flex items-center justify-between text-xs">
                    <div className="font-medium tabular-nums">
                      {t("admin.dashboardsA.crm.booked", {
                        count: numberFormatter.format(discoveryCallsBooked),
                      })}
                    </div>
                    <div className="text-muted-foreground tabular-nums">
                      {t("admin.dashboardsA.crm.qualifiedCount", {
                        count: numberFormatter.format(totalQualified),
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
