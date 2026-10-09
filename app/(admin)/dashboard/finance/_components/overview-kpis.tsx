"use client";

import { useI18n } from "@/components/providers/i18n-provider";
import { AdminStatusBadge } from "@/app/(admin)/dashboard/_components/admin-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FinanceKpiSummary } from "@/lib/api/admin-dashboard";
import { formatCurrency, formatNumber } from "@/lib/i18n/format";

type OverviewKpisProps = {
  kpis?: FinanceKpiSummary;
};

export function OverviewKpis({ kpis }: OverviewKpisProps) {
  const { locale } = useI18n();

  const netCollected = kpis?.netCollectedRevenue ?? 0;
  const netCollectedChange = kpis?.netCollectedChangePercentage ?? 0;
  const pendingRevenue = kpis?.pendingRevenue ?? 0;
  const refundedRevenue = kpis?.refundedRevenue ?? 0;
  const totalDiscounts = kpis?.totalDiscounts ?? 0;
  const paidCount = kpis?.paidOrdersCount ?? 0;
  const pendingCount = kpis?.pendingOrdersCount ?? 0;

  return (
    <div className="bg-card border-border overflow-hidden rounded-xl border shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] h-full">
      <div className="grid grid-cols-1 xl:grid-cols-8 h-full">
        {/* 1. Net Collected */}
        <Card className="border-border gap-5 overflow-hidden rounded-none border-0 border-b xl:col-span-4 xl:border-r">
          <CardHeader>
            <CardTitle className="font-normal text-sm text-muted-foreground">
              {locale === "vi" ? "Doanh thu thực thu" : "Net Collected Revenue"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div className="space-y-1">
              <div className="text-2xl font-bold tracking-tight tabular-nums sm:text-3xl text-emerald-600 dark:text-emerald-400">
                {formatCurrency(netCollected, locale)}
              </div>
              <p className="text-muted-foreground text-xs">
                {locale === "vi"
                  ? `${formatNumber(paidCount, locale)} đơn hàng đã thu tiền`
                  : `${formatNumber(paidCount, locale)} paid orders`}
              </p>
            </div>
            <AdminStatusBadge
              variant={netCollectedChange >= 0 ? "success" : "danger"}
              size="sm"
            >
              {netCollectedChange >= 0 ? `+${netCollectedChange}%` : `${netCollectedChange}%`}
            </AdminStatusBadge>
          </CardContent>
        </Card>

        {/* 2. Pending Cashflow */}
        <Card className="border-border gap-5 overflow-hidden rounded-none border-0 border-b xl:col-span-4">
          <CardHeader>
            <CardTitle className="font-normal text-sm text-muted-foreground">
              {locale === "vi" ? "Tiền chờ thanh toán (COD / Pending)" : "Pending Cashflow"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div className="flex flex-col gap-1">
              <div className="text-2xl font-bold tracking-tight tabular-nums sm:text-3xl text-amber-600 dark:text-amber-400">
                {formatCurrency(pendingRevenue, locale)}
              </div>
              <p className="text-muted-foreground text-xs">
                {locale === "vi"
                  ? `${formatNumber(pendingCount, locale)} đơn hàng đang giao / chưa thanh toán`
                  : `${formatNumber(pendingCount, locale)} pending / in-transit orders`}
              </p>
            </div>
            <AdminStatusBadge variant="neutral" size="sm">
              {locale === "vi" ? "Chờ thu" : "Pending"}
            </AdminStatusBadge>
          </CardContent>
        </Card>

        {/* 3. Refunded Revenue */}
        <Card className="border-border gap-5 overflow-hidden rounded-none border-0 xl:col-span-4 xl:border-r">
          <CardHeader>
            <CardTitle className="font-normal text-sm text-muted-foreground">
              {locale === "vi" ? "Tiền hoàn trả (Refunds)" : "Refunded Revenue"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div className="flex flex-col gap-1">
              <div className="text-2xl font-bold tracking-tight tabular-nums sm:text-3xl text-rose-600 dark:text-rose-400">
                {formatCurrency(refundedRevenue, locale)}
              </div>
              <p className="text-muted-foreground text-xs">
                {locale === "vi"
                  ? "Tổng tiền từ đơn hàng hủy hoặc trả lại"
                  : "Cancelled or returned order refunds"}
              </p>
            </div>
            <AdminStatusBadge variant="danger" size="sm">
              {locale === "vi" ? "Đã hoàn" : "Refunded"}
            </AdminStatusBadge>
          </CardContent>
        </Card>

        {/* 4. Total Discounts */}
        <Card className="gap-5 overflow-hidden rounded-none border-0 xl:col-span-4">
          <CardHeader>
            <CardTitle className="font-normal text-sm text-muted-foreground">
              {locale === "vi" ? "Tổng chiết khấu & Khuyến mãi" : "Discounts & Promotions"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div className="flex flex-col gap-1">
              <div className="text-2xl font-bold tracking-tight tabular-nums sm:text-3xl text-blue-600 dark:text-blue-400">
                {formatCurrency(totalDiscounts, locale)}
              </div>
              <p className="text-muted-foreground text-xs">
                {locale === "vi"
                  ? "Giá trị giảm giá từ mã ưu đãi và voucher"
                  : "Total coupon & voucher discounts applied"}
              </p>
            </div>
            <AdminStatusBadge variant="info" size="sm">
              Coupon
            </AdminStatusBadge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
