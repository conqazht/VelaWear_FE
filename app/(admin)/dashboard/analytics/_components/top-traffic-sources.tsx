"use client";

import { Ellipsis } from "lucide-react";
import { Bar, BarChart, CartesianGrid, LabelList, type LabelProps, XAxis, YAxis } from "recharts";

import { useI18n } from "@/components/providers/i18n-provider";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getIntlLocale } from "@/lib/i18n";

type TrafficSourceDatum = {
  label: string;
  source: string;
  visitors: number;
};

const sourcesData: TrafficSourceDatum[] = [
  { label: "", source: "organicSearch", visitors: 89_400 },
  { label: "", source: "direct", visitors: 55_200 },
  { label: "", source: "social", visitors: 38_100 },
  { label: "", source: "referral", visitors: 30_400 },
  { label: "", source: "paid", visitors: 22_700 },
];

const campaignsData: TrafficSourceDatum[] = [
  { label: "", source: "springLaunch", visitors: 16_800 },
  { label: "", source: "newsletter", visitors: 12_000 },
  { label: "", source: "retargeting", visitors: 7700 },
  { label: "", source: "brandSearch", visitors: 5900 },
  { label: "", source: "partners", visitors: 4300 },
];

const referrersData: TrafficSourceDatum[] = [
  { label: "", source: "Google", visitors: 18_400 },
  { label: "", source: "LinkedIn", visitors: 8900 },
  { label: "", source: "Product Hunt", visitors: 5700 },
  { label: "", source: "GitHub", visitors: 4800 },
  { label: "", source: "Medium", visitors: 3600 },
];

const renderValueLabel = (props: LabelProps) => {
  const { height, value, y } = props;

  return (
    <text
      className="fill-foreground"
      dominantBaseline="middle"
      dx={-6}
      fontSize={14}
      textAnchor="end"
      x="100%"
      y={Number(y) + Number(height) / 2}
    >
      {value}
    </text>
  );
};

function TrafficSourceBarChart({ data }: { data: TrafficSourceDatum[] }) {
  const { locale, t } = useI18n();
  const numberFormatter = new Intl.NumberFormat(getIntlLocale(locale));
  const chartConfig = {
    visitors: {
      color: "var(--chart-1)",
      label: t("admin.dashboardsA.analytics.visitors"),
    },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={chartConfig} className="h-64 w-full">
      <BarChart
        accessibilityLayer
        data={data}
        layout="vertical"
        margin={{
          left: 0,
          right: 48,
        }}
      >
        <CartesianGrid horizontal={false} vertical={false} />
        <YAxis dataKey="source" hide tickLine={false} tickMargin={10} type="category" />
        <XAxis dataKey="visitors" hide type="number" />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              indicator="line"
              formatter={(value) => numberFormatter.format(Number(value))}
            />
          }
        />
        <Bar
          barSize={40}
          dataKey="visitors"
          fill="var(--color-visitors)"
          fillOpacity={0.5}
          radius={8}
        >
          <LabelList
            className="fill-foreground"
            dataKey="source"
            fontSize={14}
            offset={12}
            position="insideLeft"
          />
          <LabelList content={renderValueLabel} dataKey="label" />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

export function TopTrafficSources() {
  const { locale, t } = useI18n();
  const compactFormatter = new Intl.NumberFormat(getIntlLocale(locale), {
    maximumFractionDigits: 1,
    notation: "compact",
  });
  const sourceLabels: Record<string, string> = {
    brandSearch: t("admin.dashboardsA.analytics.brandSearch"),
    direct: t("admin.dashboardsA.analytics.direct"),
    newsletter: t("admin.dashboardsA.analytics.newsletter"),
    organicSearch: t("admin.dashboardsA.analytics.organicSearch"),
    paid: t("admin.dashboardsA.analytics.paid"),
    partners: t("admin.dashboardsA.analytics.partners"),
    referral: t("admin.dashboardsA.analytics.referral"),
    retargeting: t("admin.dashboardsA.analytics.retargeting"),
    social: t("admin.dashboardsA.analytics.social"),
    springLaunch: t("admin.dashboardsA.analytics.springLaunch"),
  };
  const localizeData = (data: TrafficSourceDatum[]) =>
    data.map((item) => ({
      ...item,
      label: compactFormatter.format(item.visitors),
      source: sourceLabels[item.source] ?? item.source,
    }));

  return (
    <Card className="h-full gap-2">
      <CardHeader>
        <CardTitle className="font-normal">
          {t("admin.dashboardsA.analytics.trafficSources")}
        </CardTitle>
        <CardAction>
          <Ellipsis className="size-4" />
        </CardAction>
      </CardHeader>

      <CardContent className="px-0">
        <Tabs defaultValue="sources" className="flex flex-col gap-3">
          <TabsList className="w-full justify-start border-b px-2.5" variant="line">
            <TabsTrigger className="flex-none font-normal" value="sources">
              {t("admin.dashboardsA.analytics.sources")}
            </TabsTrigger>
            <TabsTrigger className="flex-none font-normal" value="campaigns">
              {t("admin.dashboardsA.analytics.campaigns")}
            </TabsTrigger>
            <TabsTrigger className="flex-none font-normal" value="referrers">
              {t("admin.dashboardsA.analytics.referrers")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sources" className="px-4">
            <TrafficSourceBarChart data={localizeData(sourcesData)} />
          </TabsContent>

          <TabsContent value="campaigns" className="px-4">
            <TrafficSourceBarChart data={localizeData(campaignsData)} />
          </TabsContent>
          <TabsContent value="referrers" className="px-4">
            <TrafficSourceBarChart data={localizeData(referrersData)} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
