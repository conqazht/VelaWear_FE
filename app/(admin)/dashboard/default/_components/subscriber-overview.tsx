"use client";

import { Download } from "lucide-react";

import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getIntlLocale } from "@/lib/i18n";

import customersData from "./data.json";
import type { RecentCustomerRow } from "./recent-customers-table/schema";
import { RecentCustomersTable } from "./recent-customers-table/table";

const customers = customersData as RecentCustomerRow[];

export function SubscriberOverview() {
  const { locale, t } = useI18n();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="leading-none">
          {t("admin.dashboardsA.default.customersTitle", {
            count: new Intl.NumberFormat(getIntlLocale(locale)).format(18_426),
          })}
        </CardTitle>
        <CardDescription>{t("admin.dashboardsA.default.customersDescription")}</CardDescription>
        <CardAction>
          <Button variant="outline" size="sm">
            <Download />
            {t("admin.dashboardsA.default.export")}
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="pt-0">
        <RecentCustomersTable data={customers} />
      </CardContent>
    </Card>
  );
}
