"use client";

import { Award, Repeat, UserCheck, Users } from "lucide-react";

import { useI18n } from "@/components/providers/i18n-provider";
import { AdminStatusBadge } from "@/app/(admin)/dashboard/_components/admin-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CrmKpiSummary } from "@/lib/api/admin-dashboard";
import { formatCurrency, formatNumber } from "@/lib/i18n/format";

type KpiCardsProps = {
  kpis?: CrmKpiSummary;
};

export function KpiCards({ kpis }: KpiCardsProps) {
  const { locale } = useI18n();

  const totalCustomers = kpis?.totalCustomers ?? 0;
  const newCustomers = kpis?.newCustomers ?? 0;
  const newCustomersChange = kpis?.newCustomersChangePercentage ?? 0;
  const activeBuyers = kpis?.activeBuyers ?? 0;
  const repeatCustomerCount = kpis?.repeatCustomerCount ?? 0;
  const repeatPurchaseRate = kpis?.repeatPurchaseRate ?? 0;
  const averageCustomerSpend = kpis?.averageCustomerSpend ?? 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* 1. Tổng khách hàng */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="font-medium text-sm text-muted-foreground">
            {locale === "vi" ? "Tổng khách hàng" : "Total Customers"}
          </CardTitle>
          <Users className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="text-2xl font-bold tracking-tight sm:text-3xl tabular-nums">
            {formatNumber(totalCustomers, locale)}
          </div>
          <p className="text-muted-foreground text-xs">
            {locale === "vi"
              ? `${formatNumber(activeBuyers, locale)} khách hàng đã phát sinh đơn`
              : `${formatNumber(activeBuyers, locale)} active buyers with orders`}
          </p>
        </CardContent>
      </Card>

      {/* 2. Khách hàng mới trong kỳ */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="font-medium text-sm text-muted-foreground">
            {locale === "vi" ? "Khách hàng mới" : "New Customers"}
          </CardTitle>
          <UserCheck className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold tracking-tight sm:text-3xl tabular-nums text-emerald-600 dark:text-emerald-400">
              {formatNumber(newCustomers, locale)}
            </div>
            <AdminStatusBadge
              variant={newCustomersChange >= 0 ? "success" : "danger"}
              size="sm"
            >
              {newCustomersChange >= 0 ? `+${newCustomersChange}%` : `${newCustomersChange}%`}
            </AdminStatusBadge>
          </div>
          <p className="text-muted-foreground text-xs">
            {locale === "vi" ? "Đăng ký tài khoản trong kỳ này" : "New accounts in this period"}
          </p>
        </CardContent>
      </Card>

      {/* 3. Tỷ lệ mua lặp lại (Repeat Purchase Rate) */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="font-medium text-sm text-muted-foreground">
            {locale === "vi" ? "Tỷ lệ mua lặp lại" : "Repeat Purchase Rate"}
          </CardTitle>
          <Repeat className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold tracking-tight sm:text-3xl tabular-nums text-blue-600 dark:text-blue-400">
              {repeatPurchaseRate}%
            </div>
            <AdminStatusBadge variant="neutral" size="sm">
              {locale === "vi"
                ? `${formatNumber(repeatCustomerCount, locale)} khách mua ≥2 đơn`
                : `${formatNumber(repeatCustomerCount, locale)} repeat buyers`}
            </AdminStatusBadge>
          </div>
          <p className="text-muted-foreground text-xs">
            {locale === "vi"
              ? "Tỷ lệ người mua quay lại mua hàng"
              : "Percentage of buyers returning for more orders"}
          </p>
        </CardContent>
      </Card>

      {/* 4. Chi tiêu trung bình / khách hàng */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="font-medium text-sm text-muted-foreground">
            {locale === "vi" ? "Chi tiêu trung bình / Khách" : "Avg Spend / Customer"}
          </CardTitle>
          <Award className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="text-2xl font-bold tracking-tight sm:text-3xl tabular-nums text-indigo-600 dark:text-indigo-400">
            {formatCurrency(averageCustomerSpend, locale)}
          </div>
          <p className="text-muted-foreground text-xs">
            {locale === "vi"
              ? "Doanh số bình quân tính trên người mua"
              : "Average revenue generated per buyer"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
