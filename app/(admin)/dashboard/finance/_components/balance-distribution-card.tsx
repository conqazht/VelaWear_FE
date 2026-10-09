"use client";

import * as React from "react";
import { Label, Pie, PieChart } from "recharts";

import { useI18n } from "@/components/providers/i18n-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

export const BalanceDistributionCard = React.memo(function BalanceDistributionCard({
  paymentStatuses = [],
}: BalanceDistributionCardProps) {
  const { locale, t } = useI18n();

  const totalAmount = React.useMemo(
    () => paymentStatuses.reduce((acc, curr) => acc + curr.totalAmount, 0),
    [paymentStatuses],
  );

  const chartData = React.useMemo(() => {
    return paymentStatuses.map((item) => {
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
  }, [paymentStatuses, t]);

  const chartConfig = React.useMemo<ChartConfig>(
    () => ({
      amount: { label: locale === "vi" ? "Số tiền" : "Amount" },
      PAID: { color: statusColors.PAID, label: "Đã thanh toán" },
      UNPAID: { color: statusColors.UNPAID, label: "Chưa thanh toán" },
      REFUNDED: { color: statusColors.REFUNDED, label: "Hoàn tiền" },
      FAILED: { color: statusColors.FAILED, label: "Thất bại" },
    }),
    [locale],
  );

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          {locale === "vi" ? "Tỷ lệ trạng thái thanh toán" : "Payment Status Distribution"}
        </CardTitle>
        <CardDescription className="text-xs">
          {locale === "vi"
            ? "Phân bổ dòng tiền theo trạng thái đã thu, chưa thu và hoàn trả"
            : "Breakdown of total cashflow by current payment settlement status"}
        </CardDescription>
      </CardHeader>

      <CardContent className="grid items-center gap-4 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)]">
        {paymentStatuses.length === 0 ? (
          <div className="text-muted-foreground col-span-2 py-8 text-center text-sm">
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
                    <p className="text-foreground text-sm font-semibold tabular-nums">
                      {formatCurrency(item.amount, locale)}
                    </p>
                  </div>
                  <div className="text-muted-foreground text-xs font-medium tabular-nums">
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
});
