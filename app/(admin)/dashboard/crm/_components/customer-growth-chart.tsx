"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { useI18n } from "@/components/providers/i18n-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { CustomerGrowthChartPoint } from "@/lib/api/admin-dashboard";
import { formatNumber } from "@/lib/i18n/format";

type CustomerGrowthChartProps = {
  data?: CustomerGrowthChartPoint[];
};

export function CustomerGrowthChart({ data = [] }: CustomerGrowthChartProps) {
  const { locale } = useI18n();

  const chartConfig = {
    newCustomersCount: {
      color: "var(--chart-1)",
      label: locale === "vi" ? "Khách đăng ký mới" : "New Customers",
    },
    activeOrdersCount: {
      color: "var(--chart-2)",
      label: locale === "vi" ? "Đơn hàng phát sinh" : "Active Orders",
    },
  } satisfies ChartConfig;

  const totalNewCustomers = data.reduce((acc, curr) => acc + (curr.newCustomersCount || 0), 0);
  const totalOrders = data.reduce((acc, curr) => acc + (curr.activeOrdersCount || 0), 0);

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              {locale === "vi"
                ? "Tăng trưởng khách hàng & Đơn hàng"
                : "Customer Growth & Order Volume"}
            </CardTitle>
            <CardDescription className="text-xs">
              {locale === "vi"
                ? "Tương quan số lượng tài khoản đăng ký mới và số đơn hàng phát sinh theo ngày"
                : "Daily comparison between new customer registrations and order volume"}
            </CardDescription>
          </div>
          <div className="text-muted-foreground flex items-center gap-4 text-xs">
            <div>
              <span className="text-foreground font-semibold">
                {formatNumber(totalNewCustomers, locale)}
              </span>{" "}
              {locale === "vi" ? "khách mới" : "new users"}
            </div>
            <div>
              <span className="text-foreground font-semibold">
                {formatNumber(totalOrders, locale)}
              </span>{" "}
              {locale === "vi" ? "đơn hàng" : "orders"}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-muted-foreground flex h-56 items-center justify-center text-sm">
            {locale === "vi" ? "Chưa có dữ liệu tăng trưởng" : "No growth data available"}
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-64 w-full">
            <BarChart
              accessibilityLayer
              data={data}
              margin={{ bottom: 0, left: 10, right: 10, top: 10 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                axisLine={false}
                dataKey="date"
                tickFormatter={(val: string) => {
                  try {
                    const [, m, d] = val.split("-");
                    return `${d}/${m}`;
                  } catch {
                    return val;
                  }
                }}
                tickLine={false}
                tickMargin={8}
              />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} width={30} />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(val) => {
                      try {
                        const [y, m, d] = String(val).split("-");
                        return `${d}/${m}/${y}`;
                      } catch {
                        return String(val);
                      }
                    }}
                  />
                }
              />
              <Bar
                dataKey="newCustomersCount"
                fill="var(--color-newCustomersCount)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="activeOrdersCount"
                fill="var(--color-activeOrdersCount)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
