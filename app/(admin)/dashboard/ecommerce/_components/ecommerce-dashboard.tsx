"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";

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
import { useAdminEcommerceDashboardQuery } from "@/lib/queries/admin-dashboard";

import { CustomerReviews } from "./customer-reviews";
import { Inventory } from "./inventory";
import { KpiStrip } from "./kpi-strip";
import { RecentOrders } from "./recent-orders";
import { TopProducts } from "./top-products";

export function EcommerceDashboard() {
  const { locale, t } = useI18n();
  const [period, setPeriod] = useState<AdminDashboardPeriod>("this-month");

  const { data, isFetching, refetch } = useAdminEcommerceDashboardQuery(period);

  const formattedDate = new Intl.DateTimeFormat(getIntlLocale(locale), {
    day: "numeric",
    month: "long",
    weekday: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {t("admin.dashboardsA.ecommerce.storeOverview")}
          </h1>
          <p className="text-muted-foreground text-sm capitalize">{formattedDate}</p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={(val) => setPeriod(val as AdminDashboardPeriod)}>
            <SelectTrigger className="w-48" id="ecommerce-period" size="sm">
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
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <KpiStrip kpis={data?.kpis} revenueChart={data?.revenueChart} />

        <div className="xl:col-span-4">
          <TopProducts topProducts={data?.topProducts} />
        </div>
        <div className="xl:col-span-4">
          <Inventory inventory={data?.inventory} />
        </div>
        <div className="xl:col-span-4">
          <CustomerReviews customerReviews={data?.customerReviews} />
        </div>

        <div className="xl:col-span-12">
          <RecentOrders recentOrders={data?.recentOrders} />
        </div>
      </div>
    </div>
  );
}
