"use client";

import { useState } from "react";
import { Download, RefreshCw } from "lucide-react";

import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getIntlLocale } from "@/lib/i18n";
import type { AdminDashboardPeriod } from "@/lib/api/admin-dashboard";
import { useAdminFinanceDashboardQuery } from "@/lib/queries/admin-dashboard";
import { downloadCsv } from "@/app/(admin)/dashboard/_components/management/resource-utils";

import { BalanceDistributionCard } from "./balance-distribution-card";
import { IncomeBreakdown } from "./income-breakdown";
import { OverviewKpis } from "./overview-kpis";
import { TransactionsOverviewCard } from "./transactions-overview-card";
import { UpcomingTransactions } from "./upcoming-transactions";

export function FinanceDashboard() {
  const { locale, t } = useI18n();
  const [period, setPeriod] = useState<AdminDashboardPeriod>("this-month");

  const { data, isFetching, refetch } = useAdminFinanceDashboardQuery(period);

  const formattedDate = new Intl.DateTimeFormat(getIntlLocale(locale), {
    day: "numeric",
    month: "long",
    weekday: "long",
    year: "numeric",
  }).format(new Date());

  const handleExportCsv = () => {
    if (!data) return;

    const exportRows = (data.cashflowChart || []).map((point) => ({
      [locale === "vi" ? "Ngày" : "Date"]: point.date,
      [locale === "vi" ? "Thực thu" : "Collected"]: point.collectedAmount,
      [locale === "vi" ? "Chờ thu" : "Pending"]: point.pendingAmount,
      [locale === "vi" ? "Hoàn trả" : "Refunded"]: point.refundedAmount,
    }));

    if (exportRows.length > 0) {
      downloadCsv(
        `finance-cashflow-${period}-${new Date().toISOString().slice(0, 10)}.csv`,
        exportRows,
      );
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {locale === "vi" ? "Báo cáo thanh toán & Dòng tiền" : "Payments & Cashflow"}
          </h1>
          <p className="text-muted-foreground text-sm capitalize">{formattedDate}</p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={(val) => setPeriod(val as AdminDashboardPeriod)}>
            <SelectTrigger className="w-48" id="finance-period" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="this-month">
                  {t("admin.dashboardsA.common.thisMonth")}
                </SelectItem>
                <SelectItem value="last-month">
                  {t("admin.dashboardsA.common.lastMonth")}
                </SelectItem>
                <SelectItem value="last-30-days">
                  {t("admin.dashboardsA.ecommerce.last30Days")}
                </SelectItem>
                <SelectItem value="year-to-date">
                  {t("admin.dashboardsA.common.yearToDate")}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Button
            aria-label="Refresh data"
            size="icon-sm"
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} />
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleExportCsv}
            disabled={!data || (data.cashflowChart || []).length === 0}
          >
            <Download className="mr-1.5 size-4" />
            {locale === "vi" ? "Xuất dữ liệu" : "Export"}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Row 1: 4 Compact KPI Cards */}
        <OverviewKpis kpis={data?.kpis} />

        {/* Row 2: Cashflow Trend Chart (7 cols) + Payment Status Donut (5 cols) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <TransactionsOverviewCard cashflowChart={data?.cashflowChart} />
          </div>
          <div className="lg:col-span-5">
            <BalanceDistributionCard paymentStatuses={data?.paymentStatuses} />
          </div>
        </div>

        {/* Row 3: Payment Method Gateways (5 cols) + Recent Payment Transactions (7 cols) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <IncomeBreakdown paymentMethods={data?.paymentMethods} />
          </div>
          <div className="lg:col-span-7">
            <UpcomingTransactions recentTransactions={data?.recentTransactions} />
          </div>
        </div>
      </div>
    </div>
  );
}
