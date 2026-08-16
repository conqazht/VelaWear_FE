"use client";

import { useI18n } from "@/components/providers/i18n-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { AnalyticsKpiStrip } from "./analytics-kpi-strip";
import { AnalyticsToolbar } from "./analytics-toolbar";
import { RealtimeVisitors } from "./realtime-visitors";
import { TopPages } from "./top-pages";
import { TopTrafficSources } from "./top-traffic-sources";
import { TrafficQuality } from "./traffic-quality";

const secondaryViews = ["audience", "acquisition", "engagement", "conversions"] as const;

export function AnalyticsDashboard() {
  const { t } = useI18n();
  const viewLabels = {
    audience: t("admin.dashboardsA.analytics.audience"),
    acquisition: t("admin.dashboardsA.analytics.acquisition"),
    engagement: t("admin.dashboardsA.analytics.engagement"),
    conversions: t("admin.dashboardsA.analytics.conversions"),
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h1 className="text-3xl tracking-tight">{t("admin.dashboardsA.analytics.greeting")}</h1>
        <p className="text-muted-foreground text-sm">
          {t("admin.dashboardsA.analytics.description")}
        </p>
      </div>

      <Tabs defaultValue="overview" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList className="gap-1">
            <TabsTrigger value="overview">{t("admin.dashboardsA.analytics.overview")}</TabsTrigger>
            {secondaryViews.map((view) => (
              <TabsTrigger key={view} value={view}>
                {viewLabels[view]}
              </TabsTrigger>
            ))}
          </TabsList>

          <AnalyticsToolbar />
        </div>

        <TabsContent value="overview" className="flex flex-col gap-4">
          <AnalyticsKpiStrip />

          <div className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-12">
            <div className="xl:col-span-7">
              <TrafficQuality />
            </div>
            <div className="xl:col-span-5">
              <RealtimeVisitors />
            </div>
          </div>

          <div className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-12">
            <div className="xl:col-span-7">
              <TopPages />
            </div>
            <div className="xl:col-span-5 xl:col-start-8">
              <TopTrafficSources />
            </div>
          </div>
        </TabsContent>

        {secondaryViews.map((view) => (
          <TabsContent key={view} value={view}>
            <div className="border-border text-muted-foreground flex h-64 items-center justify-center rounded-xl border border-dashed">
              {t("admin.dashboardsA.analytics.comingSoon", { view: viewLabels[view] })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
