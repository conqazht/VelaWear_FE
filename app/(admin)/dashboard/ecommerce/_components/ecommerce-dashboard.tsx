"use client";

import { Settings2 } from "lucide-react";

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
import { Separator } from "@/components/ui/separator";
import { getIntlLocale } from "@/lib/i18n";

import { CustomerReviews } from "./customer-reviews";
import { Inventory } from "./inventory";
import { KpiStrip } from "./kpi-strip";
import { RecentOrders } from "./recent-orders";
import { StoreTraffic } from "./store-traffic";
import { TopProducts } from "./top-products";
import { TrafficSources } from "./traffic-sources";

export function EcommerceDashboard() {
  const { locale, t } = useI18n();
  const formattedDate = new Intl.DateTimeFormat(getIntlLocale(locale), {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
    weekday: "long",
    year: "numeric",
  }).format(new Date("2024-04-15T12:00:00Z"));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl leading-none tracking-tight">
            {t("admin.dashboardsA.ecommerce.storeOverview")}
          </h1>
          <p className="text-muted-foreground text-sm">{formattedDate}</p>
        </div>

        <div className="flex flex-wrap items-end justify-end gap-2 lg:w-fit">
          <Select defaultValue="this-month">
            <SelectTrigger className="w-34" id="ecommerce-period" size="sm">
              <SelectValue placeholder={t("admin.dashboardsA.common.thisMonth")} />
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

          <Select defaultValue="all-channels">
            <SelectTrigger className="w-40" id="ecommerce-channel" size="sm">
              <SelectValue placeholder={t("admin.dashboardsA.ecommerce.allChannels")} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all-channels">
                  {t("admin.dashboardsA.ecommerce.allChannels")}
                </SelectItem>
                <SelectItem value="online-store">
                  {t("admin.dashboardsA.ecommerce.onlineStore")}
                </SelectItem>
                <SelectItem value="marketplace">
                  {t("admin.dashboardsA.ecommerce.marketplace")}
                </SelectItem>
                <SelectItem value="social">{t("admin.dashboardsA.ecommerce.social")}</SelectItem>
                <SelectItem value="retail">{t("admin.dashboardsA.ecommerce.retail")}</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Separator orientation="vertical" />

          <Button
            aria-label={t("admin.dashboardsA.ecommerce.settingsAria")}
            size="icon-sm"
            variant="outline"
          >
            <Settings2 />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <KpiStrip />
        <div className="xl:col-span-5">
          <StoreTraffic />
        </div>
        <div className="xl:col-span-7">
          <TrafficSources />
        </div>
        <div className="xl:col-span-4">
          <TopProducts />
        </div>
        <div className="xl:col-span-4">
          <Inventory />
        </div>
        <div className="xl:col-span-4">
          <CustomerReviews />
        </div>
        <div className="xl:col-span-12">
          <RecentOrders />
        </div>
      </div>
    </div>
  );
}
