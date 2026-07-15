"use client";

import { Ellipsis, FileDown, FileUp, RefreshCw, Share2 } from "lucide-react";

import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function AnalyticsToolbar() {
  const { t } = useI18n();

  return (
    <div className="flex items-center gap-2">
      <Select defaultValue="last-4-weeks">
        <SelectTrigger className="w-34">
          <SelectValue placeholder={t("admin.dashboardsA.common.selectRange")} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="last-7-days">{t("admin.dashboardsA.common.last7Days")}</SelectItem>
            <SelectItem value="last-4-weeks">{t("admin.dashboardsA.common.last4Weeks")}</SelectItem>
            <SelectItem value="last-3-months">{t("admin.dashboardsA.common.last3Months")}</SelectItem>
            <SelectItem value="year-to-date">{t("admin.dashboardsA.common.yearToDate")}</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              size="icon"
              variant="outline"
              aria-label={t("admin.dashboardsA.analytics.actionsAria")}
            />
          }
        >
          <Ellipsis />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuGroup>
            <DropdownMenuLabel>{t("admin.dashboardsA.analytics.actions")}</DropdownMenuLabel>
            <DropdownMenuItem>
              <FileDown />
              {t("admin.dashboardsA.analytics.exportReport")}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FileUp />
              {t("admin.dashboardsA.analytics.importData")}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Share2 />
              {t("admin.dashboardsA.analytics.shareDashboard")}
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <RefreshCw />
              {t("admin.dashboardsA.analytics.refreshMetrics")}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
