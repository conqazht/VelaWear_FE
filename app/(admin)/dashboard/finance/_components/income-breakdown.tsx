"use client";

import { useI18n } from "@/components/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { PaymentMethodSummary } from "@/lib/api/admin-dashboard";
import { formatCurrency, formatNumber } from "@/lib/i18n/format";
import { getPaymentMethodLabel } from "@/app/(admin)/dashboard/orders/_components/order-status-badge";

type IncomeBreakdownProps = {
  paymentMethods?: PaymentMethodSummary[];
};

export function IncomeBreakdown({ paymentMethods = [] }: IncomeBreakdownProps) {
  const { locale, t } = useI18n();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-normal text-sm text-muted-foreground">
          {locale === "vi" ? "Doanh thu theo phương thức thanh toán" : "Revenue by Payment Method"}
        </CardTitle>
      </CardHeader>

      <CardContent>
        {paymentMethods.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            {locale === "vi" ? "Chưa có dữ liệu thanh toán" : "No payment data available"}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {paymentMethods.map((item, index) => {
              const label = getPaymentMethodLabel(item.method, t);
              const barOpacity = Math.max(0.3, 1 - index * 0.15);

              return (
                <section key={item.method} className="isolate flex gap-[0.5px]">
                  <Separator
                    orientation="vertical"
                    className="border-muted-foreground/50 mb-1 h-auto self-auto border-l border-dashed bg-transparent"
                  />
                  <div className="flex min-h-24 flex-1 flex-col justify-between">
                    <div className="flex min-w-0 flex-col gap-1 px-1.5">
                      <p className="text-muted-foreground text-xs leading-none truncate font-medium">
                        {label} ({item.percentage}%)
                      </p>
                      <div className="text-base font-bold leading-none tracking-tight tabular-nums text-foreground">
                        {formatCurrency(item.totalAmount, locale)}
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        {locale === "vi"
                          ? `${formatNumber(item.count, locale)} đơn hàng`
                          : `${formatNumber(item.count, locale)} orders`}
                      </span>
                    </div>
                    <div
                      className="bg-primary -ml-0.5 h-3 rounded-sm"
                      style={{ opacity: barOpacity, width: `${Math.max(10, item.percentage)}%` }}
                    />
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
