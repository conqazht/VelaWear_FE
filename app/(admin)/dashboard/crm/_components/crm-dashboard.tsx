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
import { useAdminCrmDashboardQuery } from "@/lib/queries/admin-dashboard";
import { downloadCsv } from "@/app/(admin)/dashboard/_components/management/resource-utils";

import { CustomerGrowthChart } from "./customer-growth-chart";
import { KpiCards } from "./kpi-cards";
import { MembershipTiersCard } from "./membership-tiers-card";
import { TopCustomersCard } from "./top-customers-card";

export function CrmDashboard() {
  const { locale, t } = useI18n();
  const [period, setPeriod] = useState<AdminDashboardPeriod>("this-month");

  const { data, isFetching, refetch } = useAdminCrmDashboardQuery(period);

  const formattedDate = new Intl.DateTimeFormat(getIntlLocale(locale), {
    day: "numeric",
    month: "long",
    weekday: "long",
    year: "numeric",
  }).format(new Date());

  const handleExportCsv = () => {
    if (!data) return;

    const exportRows = (data.customerGrowthChart || []).map((point) => ({
      [locale === "vi" ? "Ngày" : "Date"]: point.date,
      [locale === "vi" ? "Khách mới" : "New Customers"]: point.newCustomersCount,
      [locale === "vi" ? "Đơn hàng" : "Orders"]: point.activeOrdersCount,
    }));

    if (exportRows.length > 0) {
      downloadCsv(`crm-growth-${period}-${new Date().toISOString().slice(0, 10)}.csv`, exportRows);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {locale === "vi" ? "Báo cáo khách hàng & Phân khúc" : "Customer Insights & CRM"}
          </h1>
          <p className="text-muted-foreground text-sm capitalize">{formattedDate}</p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={(val) => setPeriod(val as AdminDashboardPeriod)}>
            <SelectTrigger className="w-48" id="crm-period" size="sm">
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
            disabled={!data || (data.customerGrowthChart || []).length === 0}
          >
            <Download className="mr-1.5 size-4" />
            {locale === "vi" ? "Xuất dữ liệu" : "Export"}
          </Button>
        </div>
      </div>

      <KpiCards kpis={data?.kpis} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 xl:col-span-8">
          <CustomerGrowthChart data={data?.customerGrowthChart} />
        </div>
        <div className="lg:col-span-5 xl:col-span-4">
          <MembershipTiersCard tiers={data?.membershipTiers} />
        </div>
      </div>

      <TopCustomersCard customers={data?.topCustomers} />
    </div>
  );
}
