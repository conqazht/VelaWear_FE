"use client";

import * as React from "react";
import { Clock, RotateCcw, TicketPercent, Wallet } from "lucide-react";

import { useI18n } from "@/components/providers/i18n-provider";
import { AdminStatusBadge } from "@/app/(admin)/dashboard/_components/admin-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FinanceKpiSummary } from "@/lib/api/admin-dashboard";
import { formatCurrency, formatNumber } from "@/lib/i18n/format";

type OverviewKpisProps = {
  kpis?: FinanceKpiSummary;
};

export const OverviewKpis = React.memo(function OverviewKpis({ kpis }: OverviewKpisProps) {
  const { locale } = useI18n();

  const netCollected = kpis?.netCollectedRevenue ?? 0;
  const netCollectedChange = kpis?.netCollectedChangePercentage ?? 0;
  const pendingRevenue = kpis?.pendingRevenue ?? 0;
  const refundedRevenue = kpis?.refundedRevenue ?? 0;
  const totalDiscounts = kpis?.totalDiscounts ?? 0;
  const paidCount = kpis?.paidOrdersCount ?? 0;
  const pendingCount = kpis?.pendingOrdersCount ?? 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* 1. Net Collected Revenue */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-muted-foreground text-sm font-medium">
            {locale === "vi" ? "Doanh thu thực thu" : "Net Collected Revenue"}
          </CardTitle>
          <Wallet className="size-4 text-emerald-600 dark:text-emerald-400" />
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold tracking-tight text-emerald-600 tabular-nums sm:text-3xl dark:text-emerald-400">
              {formatCurrency(netCollected, locale)}
            </div>
            <AdminStatusBadge variant={netCollectedChange >= 0 ? "success" : "danger"} size="sm">
              {netCollectedChange >= 0 ? `+${netCollectedChange}%` : `${netCollectedChange}%`}
            </AdminStatusBadge>
          </div>
          <p className="text-muted-foreground text-xs">
            {locale === "vi"
              ? `${formatNumber(paidCount, locale)} đơn hàng đã thu tiền`
              : `${formatNumber(paidCount, locale)} paid orders`}
          </p>
        </CardContent>
      </Card>

      {/* 2. Pending Cashflow */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-muted-foreground text-sm font-medium">
            {locale === "vi" ? "Tiền chờ thanh toán" : "Pending Cashflow"}
          </CardTitle>
          <Clock className="size-4 text-amber-600 dark:text-amber-400" />
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold tracking-tight text-amber-600 tabular-nums sm:text-3xl dark:text-amber-400">
              {formatCurrency(pendingRevenue, locale)}
            </div>
            <AdminStatusBadge variant="neutral" size="sm">
              {locale === "vi" ? "Chờ thu" : "Pending"}
            </AdminStatusBadge>
          </div>
          <p className="text-muted-foreground text-xs">
            {locale === "vi"
              ? `${formatNumber(pendingCount, locale)} đơn hàng đang giao / chưa thanh toán`
              : `${formatNumber(pendingCount, locale)} pending / in-transit orders`}
          </p>
        </CardContent>
      </Card>

      {/* 3. Refunded Revenue */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-muted-foreground text-sm font-medium">
            {locale === "vi" ? "Tiền hoàn trả" : "Refunded Revenue"}
          </CardTitle>
          <RotateCcw className="size-4 text-rose-600 dark:text-rose-400" />
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold tracking-tight text-rose-600 tabular-nums sm:text-3xl dark:text-rose-400">
              {formatCurrency(refundedRevenue, locale)}
            </div>
            <AdminStatusBadge variant="danger" size="sm">
              {locale === "vi" ? "Đã hoàn" : "Refunded"}
            </AdminStatusBadge>
          </div>
          <p className="text-muted-foreground text-xs">
            {locale === "vi"
              ? "Tổng tiền từ đơn hàng hủy hoặc hoàn"
              : "Cancelled or returned order refunds"}
          </p>
        </CardContent>
      </Card>

      {/* 4. Total Discounts */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-muted-foreground text-sm font-medium">
            {locale === "vi" ? "Chiết khấu & Khuyến mãi" : "Discounts & Promotions"}
          </CardTitle>
          <TicketPercent className="size-4 text-blue-600 dark:text-blue-400" />
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold tracking-tight text-blue-600 tabular-nums sm:text-3xl dark:text-blue-400">
              {formatCurrency(totalDiscounts, locale)}
            </div>
            <AdminStatusBadge variant="info" size="sm">
              Coupon
            </AdminStatusBadge>
          </div>
          <p className="text-muted-foreground text-xs">
            {locale === "vi"
              ? "Tổng giảm trừ từ mã ưu đãi và voucher"
              : "Total coupon & voucher discounts applied"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
});
