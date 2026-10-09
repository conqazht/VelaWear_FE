"use client";

import * as React from "react";
import { Label, Pie, PieChart } from "recharts";

import { useI18n } from "@/components/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { PaymentStatusSummary } from "@/lib/api/admin-dashboard";
import { formatCurrency, formatNumber } from "@/lib/i18n/format";
import { getPaymentStatusLabel } from "@/app/(admin)/dashboard/orders/_components/order-status-badge";
import type { AdminPaymentStatus } from "@/lib/api/admin-orders";

type BalanceDistributionCardProps = {
  paymentStatuses?: PaymentStatusSummary[];
};

const statusColors: Record<string, string> = {
  PAID: "var(--chart-2)",
  UNPAID: "var(--chart-4)",
  REFUNDED: "var(--chart-5)",
  FAILED: "var(--chart-3)",
};

export function BalanceDistributionCard({ paymentStatuses = [] }: BalanceDistributionCardProps) {
  const { locale, t } = useI18n();

  const totalAmount = paymentStatuses.reduce((acc, curr) => acc + curr.totalAmount, 0);

  const chartData = paymentStatuses.map((item) => {
    const label = ["PAID", "UNPAID", "REFUNDED", "FAILED"].includes(item.status)
      ? getPaymentStatusLabel(item.status as AdminPaymentStatus, t)
      : item.status;
    return {
      status: item.status,
      label,
      amount: item.totalAmount,
      count: item.count,
      percentage: item.percentage,
      fill: statusColors[item.status] || "var(--chart-1)",
    };
  });

  const chartConfig = {
    amount: { label: locale === "vi" ? "Số tiền" : "Amount" },
    PAID: { color: statusColors.PAID, label: "Đã thanh toán" },
    UNPAID: { color: statusColors.UNPAID, label: "Chưa thanh toán" },
    REFUNDED: { color: statusColors.REFUNDED, label: "Hoàn tiền" },
    FAILED: { color: statusColors.FAILED, label: "Thất bại" },
  } satisfies ChartConfig;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-normal text-sm text-muted-foreground">
          {locale === "vi" ? "Tỷ lệ trạng thái thanh toán" : "Payment Status Distribution"}
        </CardTitle>
      </CardHeader>

      <CardContent className="grid items-center gap-4 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)]">
        {paymentStatuses.length === 0 ? (
          <div className="col-span-2 py-8 text-center text-sm text-muted-foreground">
            {locale === "vi" ? "Chưa có dữ liệu thanh toán" : "No payment data"}
          </div>
        ) : (
          <>
            <ChartContainer config={chartConfig} className="mx-auto aspect-square h-50">
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel className="w-52" nameKey="label" />}
                />
                <Pie
                  cornerRadius={6}
                  data={chartData}
                  dataKey="amount"
                  innerRadius={60}
                  nameKey="label"
                  outerRadius={85}
                  paddingAngle={2}
                  strokeWidth={4}
                >
                  <Label
                    content={({ viewBox }) => {
                      if (!(viewBox && "cx" in viewBox && "cy" in viewBox)) {
                        return null;
                      }

                      return (
                        <text
                          dominantBaseline="middle"
                          textAnchor="middle"
                          x={viewBox.cx}
                          y={viewBox.cy}
                        >
                          <tspan
                            className="fill-muted-foreground text-xs"
                            x={viewBox.cx}
                            y={(viewBox.cy ?? 0) - 8}
                          >
                            {locale === "vi" ? "Tổng cộng" : "Total"}
                          </tspan>
                          <tspan
                            className="fill-foreground font-heading text-base font-semibold tabular-nums"
                            x={viewBox.cx}
                            y={(viewBox.cy ?? 0) + 14}
                          >
                            {formatCurrency(totalAmount, locale)}
                          </tspan>
                        </text>
                      );
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>

            <div className="flex min-w-0 flex-col gap-3">
              {chartData.map((item) => (
                <div className="grid grid-cols-[1fr_auto] items-end gap-3" key={item.status}>
                  <div className="min-w-0">
                    <div className="flex min-w-0 items-center gap-1.5">
                      <span
                        aria-hidden="true"
                        className="size-2 rounded-full"
                        style={{ backgroundColor: item.fill }}
                      />
                      <p className="text-muted-foreground truncate text-xs font-medium">
                        {item.label} ({formatNumber(item.count, locale)})
                      </p>
                    </div>
                    <p className="font-semibold text-sm tabular-nums text-foreground">
                      {formatCurrency(item.amount, locale)}
                    </p>
                  </div>
                  <div className="font-medium text-xs tabular-nums text-muted-foreground">
                    {item.percentage}%
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
