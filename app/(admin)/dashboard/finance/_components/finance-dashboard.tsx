"use client";

import { Download, RotateCw, Settings2 } from "lucide-react";

import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/i18n/format";

import { BalanceDistributionCard } from "./balance-distribution-card";
import { FinanceNotification } from "./finance-notification";
import { IncomeBreakdown } from "./income-breakdown";
import { OverviewKpis } from "./overview-kpis";
import { QuickActions } from "./quick-actions";
import { TransactionsOverviewCard } from "./transactions-overview-card";
import { UpcomingTransactions } from "./upcoming-transactions";
import { Wallet } from "./wallet";

export function FinanceDashboard() {
  const { locale, t } = useI18n();
  const formattedDate = formatDate("2024-04-15T12:00:00Z", locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h1 className="text-3xl tracking-tight">{t("admin.finance.title")}</h1>
        <p className="text-muted-foreground text-sm">{formattedDate}</p>
      </div>

      <Tabs defaultValue="30-days" className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <TabsList variant="line">
            <TabsTrigger value="30-days">{t("admin.finance.tab.dashboard")}</TabsTrigger>
            <TabsTrigger value="12-months">{t("admin.finance.tab.accounts")}</TabsTrigger>
            <TabsTrigger value="custom">{t("admin.finance.tab.transactions")}</TabsTrigger>
          </TabsList>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
              <RotateCw className="size-4" aria-hidden="true" />
              <span>{t("admin.finance.updated", { minutes: 5 })}</span>
            </div>
            <Button size="sm" variant="outline">
              <Settings2 aria-hidden="true" />
              {t("admin.finance.settings")}
            </Button>
            <Button size="sm" variant="outline">
              <Download data-icon="inline-start" aria-hidden="true" />
              {t("admin.finance.export")}
            </Button>
          </div>
        </div>

        <TabsContent value="30-days" className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
            <div className="xl:col-span-6"><OverviewKpis /></div>
            <div className="flex flex-col gap-4 xl:col-span-6">
              <IncomeBreakdown />
              <FinanceNotification />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
            <div className="xl:col-span-7"><TransactionsOverviewCard /></div>
            <div className="xl:col-span-5"><BalanceDistributionCard /></div>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
            <div className="xl:col-span-4"><Wallet /></div>
            <div className="xl:col-span-4"><UpcomingTransactions /></div>
            <div className="xl:col-span-4"><QuickActions /></div>
          </div>
        </TabsContent>

        <TabsContent value="12-months">
          <div className="flex h-64 items-center justify-center rounded-xl border border-border border-dashed text-muted-foreground">
            {t("admin.finance.accountsComingSoon")}
          </div>
        </TabsContent>

        <TabsContent value="custom">
          <div className="flex h-64 items-center justify-center rounded-xl border border-border border-dashed text-muted-foreground">
            {t("admin.finance.transactionsComingSoon")}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
