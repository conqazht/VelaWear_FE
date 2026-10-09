"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import { useI18n } from "@/components/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { CashflowChartPoint } from "@/lib/api/admin-dashboard";
import { formatCurrency, formatDate } from "@/lib/i18n/format";

type TransactionsOverviewCardProps = {
  cashflowChart?: CashflowChartPoint[];
};

export function TransactionsOverviewCard({ cashflowChart = [] }: TransactionsOverviewCardProps) {
  const { locale, t } = useI18n();

  const formatTooltipCurrency = (value: number | string) =>
    formatCurrency(Number(value), locale);

  const chartConfig = {
    collectedAmount: {
      color: "var(--chart-2)",
      label: locale === "vi" ? "Thực thu" : "Collected",
    },
    pendingAmount: {
      color: "var(--chart-4)",
      label: locale === "vi" ? "Chờ thu (Pending)" : "Pending",
    },
    refundedAmount: {
      color: "var(--chart-5)",
      label: locale === "vi" ? "Hoàn trả" : "Refunded",
    },
  } satisfies ChartConfig;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-normal text-sm text-muted-foreground">
          {locale === "vi" ? "Biến động dòng tiền theo ngày" : "Daily Cashflow Movements"}
        </CardTitle>
      </CardHeader>

      <CardContent>
        {cashflowChart.length === 0 ? (
          <div className="flex h-50 items-center justify-center text-sm text-muted-foreground">
            {locale === "vi" ? "Chưa có dữ liệu dòng tiền" : "No cashflow data available"}
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-56 w-full">
            <LineChart
              accessibilityLayer
              data={cashflowChart}
              margin={{ bottom: 0, left: 10, right: 10, top: 10 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                axisLine={false}
                dataKey="date"
                tickFormatter={(val: string) => {
                  try {
                    const [y, m, d] = val.split("-");
                    return `${d}/${m}`;
                  } catch {
                    return val;
                  }
                }}
                tickLine={false}
                tickMargin={10}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                hide
                axisLine={false}
                tickLine={false}
                tickMargin={10}
                tick={{ fontSize: 12 }}
              />
              <ChartTooltip
                cursor={false}
                content={({ active, payload, label }) => (
                  <ChartTooltipContent
                    active={active}
                    label={label}
                    payload={payload?.map((item) => ({
                      ...item,
                      value:
                        typeof item.value === "number"
                          ? formatTooltipCurrency(item.value)
                          : item.value,
                    }))}
                  />
                )}
              />
              <Line
                dataKey="collectedAmount"
                name={locale === "vi" ? "Thực thu" : "Collected"}
                dot={false}
                stroke="var(--color-collectedAmount)"
                strokeLinecap="round"
                strokeWidth={2.5}
                type="monotone"
              />
              <Line
                dataKey="pendingAmount"
                name={locale === "vi" ? "Chờ thu" : "Pending"}
                dot={false}
                stroke="var(--color-pendingAmount)"
                strokeDasharray="4 4"
                strokeLinecap="round"
                strokeWidth={2}
                type="monotone"
              />
              <Line
                dataKey="refundedAmount"
                name={locale === "vi" ? "Hoàn trả" : "Refunded"}
                dot={false}
                stroke="var(--color-refundedAmount)"
                strokeDasharray="2 2"
                strokeLinecap="round"
                strokeWidth={2}
                type="monotone"
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
