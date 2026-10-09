"use client";

import * as React from "react";
import { CreditCard } from "lucide-react";

import { useI18n } from "@/components/providers/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { PaymentMethodSummary } from "@/lib/api/admin-dashboard";
import { formatCurrency, formatNumber } from "@/lib/i18n/format";
import { getPaymentMethodLabel } from "@/app/(admin)/dashboard/orders/_components/order-status-badge";

type IncomeBreakdownProps = {
  paymentMethods?: PaymentMethodSummary[];
};

const METHOD_THEMES: Record<string, { badgeClass: string; indicatorClass: string }> = {
  MOMO: {
    badgeClass: "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-950 dark:text-pink-300",
    indicatorClass: "*:data-[slot='progress-indicator']:bg-pink-500",
  },
  VNPAY: {
    badgeClass: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300",
    indicatorClass: "*:data-[slot='progress-indicator']:bg-blue-500",
  },
  COD: {
    badgeClass:
      "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300",
    indicatorClass: "*:data-[slot='progress-indicator']:bg-amber-500",
  },
  STRIPE: {
    badgeClass:
      "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-300",
    indicatorClass: "*:data-[slot='progress-indicator']:bg-purple-500",
  },
};

export const IncomeBreakdown = React.memo(function IncomeBreakdown({
  paymentMethods = [],
}: IncomeBreakdownProps) {
  const { locale, t } = useI18n();

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          {locale === "vi" ? "Cổng thanh toán & Thị phần" : "Payment Gateways & Market Share"}
        </CardTitle>
        <CardDescription className="text-xs">
          {locale === "vi"
            ? "Tỷ trọng doanh thu và số đơn hàng theo từng phương thức"
            : "Revenue distribution and order count by payment provider"}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {paymentMethods.length === 0 ? (
          <div className="text-muted-foreground flex h-48 items-center justify-center text-sm">
            {locale === "vi" ? "Chưa có dữ liệu thanh toán" : "No payment data available"}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {paymentMethods.map((item) => {
              const label = getPaymentMethodLabel(item.method, t);
              const theme = METHOD_THEMES[item.method.toUpperCase()] ?? {
                badgeClass: "bg-muted text-muted-foreground",
                indicatorClass: "*:data-[slot='progress-indicator']:bg-primary",
              };

              return (
                <div key={item.method} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`gap-1 px-2 py-0.5 text-xs ${theme.badgeClass}`}
                      >
                        <CreditCard className="size-3" />
                        <span>{label}</span>
                      </Badge>
                      <span className="text-muted-foreground text-xs">({item.percentage}%)</span>
                    </div>

                    <div className="flex items-center gap-2 tabular-nums">
                      <span className="text-foreground font-semibold">
                        {formatCurrency(item.totalAmount, locale)}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        ({formatNumber(item.count, locale)} {locale === "vi" ? "đơn" : "orders"})
                      </span>
                    </div>
                  </div>

                  <Progress value={item.percentage} className={`h-2 ${theme.indicatorClass}`} />
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
});
