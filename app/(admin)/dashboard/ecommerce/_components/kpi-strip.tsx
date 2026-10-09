"use client";

import * as React from "react";
import {
  DollarSign,
  ReceiptText,
  RotateCcw,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Area, Bar, CartesianGrid, ComposedChart, XAxis, YAxis } from "recharts";

import { useI18n } from "@/components/providers/i18n-provider";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { DashboardKpiSummary, RevenueChartPoint } from "@/lib/api/admin-dashboard";
import { formatCurrency, formatNumber } from "@/lib/i18n/format";

type KpiStripProps = {
  kpis?: DashboardKpiSummary;
  revenueChart?: RevenueChartPoint[];
};

export const KpiStrip = React.memo(function KpiStrip({ kpis, revenueChart = [] }: KpiStripProps) {
  const { locale, t } = useI18n();

  const revenueOverviewConfig = React.useMemo<ChartConfig>(
    () => ({
      revenue: {
        label: t("admin.dashboardsA.ecommerce.revenue"),
        color: "var(--chart-1)",
      },
      orders: {
        label: t("admin.dashboardsA.ecommerce.totalOrders"),
        color: "var(--chart-2)",
      },
    }),
    [t],
  );

  // Fallbacks if data not yet loaded
  const grossSales = kpis?.grossSales ?? 0;
  const grossSalesChange = kpis?.grossSalesChangePercentage ?? 0;
  const totalOrders = kpis?.totalOrders ?? 0;
  const totalOrdersChange = kpis?.totalOrdersChangePercentage ?? 0;
  const averageOrderValue = kpis?.averageOrderValue ?? 0;
  const aovChange = kpis?.aovChangePercentage ?? 0;
  const cancellationsCount = kpis?.cancellationsCount ?? 0;
  const cancellationRate = kpis?.cancellationRate ?? 0;

  const chartData = React.useMemo(
    () =>
      revenueChart.map((point) => ({
        period: point.date,
        revenue: point.revenue,
        orders: point.orderCount,
      })),
    [revenueChart],
  );

  return (
    <div className="bg-card border-border h-full overflow-hidden rounded-xl border shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] xl:col-span-12">
      <div className="grid grid-cols-1 xl:grid-cols-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-rows-2 xl:col-span-5 xl:border-r">
          {/* 1. Gross Sales */}
          <Card className="border-border h-full rounded-none border-0 border-b ring-0 sm:border-r">
            <CardHeader>
              <CardTitle className="text-sm font-normal">
                {t("admin.dashboardsA.ecommerce.totalSales")}
              </CardTitle>
              <CardDescription className="text-foreground text-2xl leading-none font-bold tracking-tight tabular-nums sm:text-3xl">
                {formatCurrency(grossSales, locale)}
              </CardDescription>
              <CardAction className="bg-muted grid size-6 place-items-center rounded-sm">
                <DollarSign className="text-foreground size-3" />
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1.5 text-xs font-medium sm:text-sm">
                {grossSalesChange >= 0 ? (
                  <span className="flex items-center text-emerald-700 dark:text-emerald-400">
                    <TrendingUp className="mr-0.5 size-3.5" />+{grossSalesChange}%
                  </span>
                ) : (
                  <span className="flex items-center text-rose-700 dark:text-rose-400">
                    <TrendingDown className="mr-0.5 size-3.5" />
                    {grossSalesChange}%
                  </span>
                )}
                <span className="text-muted-foreground font-normal">
                  {locale === "vi" ? "so với kỳ trước" : "vs previous period"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* 2. Total Orders */}
          <Card className="border-border h-full rounded-none border-0 border-b ring-0">
            <CardHeader>
              <CardTitle className="text-sm font-normal">
                {t("admin.dashboardsA.ecommerce.totalOrders")}
              </CardTitle>
              <CardDescription className="text-foreground text-2xl leading-none font-bold tracking-tight tabular-nums sm:text-3xl">
                {formatNumber(totalOrders, locale)}
              </CardDescription>
              <CardAction className="bg-muted grid size-6 place-items-center rounded-sm">
                <ShoppingBag className="text-foreground size-3" />
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1.5 text-xs font-medium sm:text-sm">
                {totalOrdersChange >= 0 ? (
                  <span className="flex items-center text-emerald-700 dark:text-emerald-400">
                    <TrendingUp className="mr-0.5 size-3.5" />+{totalOrdersChange}%
                  </span>
                ) : (
                  <span className="flex items-center text-rose-700 dark:text-rose-400">
                    <TrendingDown className="mr-0.5 size-3.5" />
                    {totalOrdersChange}%
                  </span>
                )}
                <span className="text-muted-foreground font-normal">
                  {locale === "vi" ? "so với kỳ trước" : "vs previous period"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* 3. Average Order Value */}
          <Card className="border-border h-full rounded-none border-0 border-b ring-0 sm:border-r sm:border-b-0">
            <CardHeader>
              <CardTitle className="text-sm font-normal">
                {t("admin.dashboardsA.ecommerce.averageOrder")}
              </CardTitle>
              <CardDescription className="text-foreground text-2xl leading-none font-bold tracking-tight tabular-nums sm:text-3xl">
                {formatCurrency(averageOrderValue, locale)}
              </CardDescription>
              <CardAction className="bg-muted grid size-6 place-items-center rounded-sm">
                <ReceiptText className="text-foreground size-3" />
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1.5 text-xs font-medium sm:text-sm">
                {aovChange >= 0 ? (
                  <span className="flex items-center text-emerald-700 dark:text-emerald-400">
                    <TrendingUp className="mr-0.5 size-3.5" />+{aovChange}%
                  </span>
                ) : (
                  <span className="flex items-center text-rose-700 dark:text-rose-400">
                    <TrendingDown className="mr-0.5 size-3.5" />
                    {aovChange}%
                  </span>
                )}
                <span className="text-muted-foreground font-normal">
                  {locale === "vi" ? "so với kỳ trước" : "vs previous period"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* 4. Cancellations / Returns */}
          <Card className="border-border h-full rounded-none border-0 ring-0">
            <CardHeader>
              <CardTitle className="text-sm font-normal">
                {locale === "vi" ? "Đơn hủy / Hoàn" : "Cancellations"}
              </CardTitle>
              <CardDescription className="text-foreground text-2xl leading-none font-bold tracking-tight tabular-nums sm:text-3xl">
                {formatNumber(cancellationsCount, locale)}
              </CardDescription>
              <CardAction className="bg-muted grid size-6 place-items-center rounded-sm">
                <RotateCcw className="text-foreground size-3" />
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1.5 text-xs font-medium sm:text-sm">
                <span className="text-amber-700 dark:text-amber-400">{cancellationRate}%</span>
                <span className="text-muted-foreground font-normal">
                  {locale === "vi" ? "tỷ lệ hủy đơn" : "cancellation rate"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right side: Revenue Chart */}
        <Card className="h-full rounded-none border-0 ring-0 xl:col-span-7">
          <CardHeader>
            <CardTitle className="font-medium">
              {t("admin.dashboardsA.ecommerce.salesOverview")}
            </CardTitle>
          </CardHeader>

          <CardContent>
            {chartData.length > 0 ? (
              <ChartContainer config={revenueOverviewConfig} className="h-64 w-full sm:h-72">
                <ComposedChart
                  accessibilityLayer
                  data={chartData}
                  margin={{ bottom: 0, left: 10, right: 10, top: 10 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="period"
                    axisLine={false}
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    tickMargin={8}
                    tickFormatter={(val) => {
                      if (!val) return "";
                      const parts = String(val).split("-");
                      return parts.length >= 3 ? `${parts[2]}/${parts[1]}` : String(val);
                    }}
                  />
                  <YAxis hide yAxisId="rev" />
                  <YAxis hide yAxisId="orders" orientation="right" />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(val, name) => (
                          <div className="flex items-center justify-between gap-4 font-mono">
                            <span className="text-muted-foreground">{String(name)}</span>
                            <span className="text-foreground font-semibold">
                              {name === t("admin.dashboardsA.ecommerce.revenue")
                                ? formatCurrency(Number(val), locale)
                                : formatNumber(Number(val), locale)}
                            </span>
                          </div>
                        )}
                      />
                    }
                  />
                  <Bar
                    yAxisId="orders"
                    dataKey="orders"
                    name={t("admin.dashboardsA.ecommerce.totalOrders")}
                    fill="var(--color-orders)"
                    opacity={0.3}
                    barSize={12}
                    radius={[4, 4, 0, 0]}
                  />
                  <Area
                    yAxisId="rev"
                    type="monotone"
                    dataKey="revenue"
                    name={t("admin.dashboardsA.ecommerce.revenue")}
                    stroke="var(--color-revenue)"
                    strokeWidth={2}
                    fill="var(--color-revenue)"
                    fillOpacity={0.15}
                  />
                </ComposedChart>
              </ChartContainer>
            ) : (
              <div className="text-muted-foreground flex h-64 items-center justify-center text-sm">
                {locale === "vi" ? "Chưa có dữ liệu biểu đồ" : "No chart data available"}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
});
