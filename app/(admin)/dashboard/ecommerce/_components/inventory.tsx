"use client";

import { ArrowUpRight, PackageCheck, PackageX, TriangleAlert } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";

import { useI18n } from "@/components/providers/i18n-provider";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";
import { Separator } from "@/components/ui/separator";
import { getIntlLocale } from "@/lib/i18n";

const chartData = [{ month: "current", "in-stock": 760, "low-stock": 320, "out-of-stock": 160 }];
const totalUnits =
  chartData[0]["in-stock"] + chartData[0]["low-stock"] + chartData[0]["out-of-stock"];
const availablePercent = Math.round((chartData[0]["in-stock"] / totalUnits) * 100);
const gaugeSegmentCount = 32;
const inStockSegments = Math.round((chartData[0]["in-stock"] / totalUnits) * gaugeSegmentCount);
const lowStockSegments = Math.round((chartData[0]["low-stock"] / totalUnits) * gaugeSegmentCount);

function getGaugeSegmentStatus(index: number) {
  if (index < inStockSegments) {
    return "in-stock";
  }

  if (index < inStockSegments + lowStockSegments) {
    return "low-stock";
  }

  return "out-of-stock";
}

const gaugeSegments = Array.from({ length: gaugeSegmentCount }, (_, index) => {
  const status = getGaugeSegmentStatus(index);
  return {
    fill: `var(--color-${status})`,
    id: `segment-${index + 1}`,
    status,
    value: 1,
  };
});

export function Inventory() {
  const { locale, t } = useI18n();
  const intlLocale = getIntlLocale(locale);
  const numberFormatter = new Intl.NumberFormat(intlLocale);
  const percentFormatter = new Intl.NumberFormat(intlLocale, { style: "percent" });
  const availableLabel = percentFormatter.format(availablePercent / 100);
  const inventorySummary = [
    {
      icon: PackageCheck,
      label: t("admin.dashboardsA.ecommerce.inStock"),
      value: chartData[0]["in-stock"],
    },
    {
      icon: TriangleAlert,
      label: t("admin.dashboardsA.ecommerce.lowStock"),
      value: chartData[0]["low-stock"],
    },
    {
      icon: PackageX,
      label: t("admin.dashboardsA.ecommerce.out"),
      value: chartData[0]["out-of-stock"],
    },
  ] as const;
  const chartConfig = {
    "in-stock": {
      label: t("admin.dashboardsA.ecommerce.inStock"),
      color: "var(--chart-2)",
    },
    "low-stock": {
      label: t("admin.dashboardsA.ecommerce.lowStock"),
      color: "var(--chart-1)",
    },
    "out-of-stock": {
      label: t("admin.dashboardsA.ecommerce.outOfStock"),
      color: "var(--destructive)",
    },
  } satisfies ChartConfig;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-muted-foreground text-sm font-normal">
          {t("admin.dashboardsA.ecommerce.inventory")}
        </CardTitle>
        <CardDescription className="text-foreground text-xl leading-none tracking-tight tabular-nums">
          {t("admin.dashboardsA.ecommerce.availablePercent", { percent: availableLabel })}
        </CardDescription>
        <CardAction>
          <ArrowUpRight className="size-4" />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ChartContainer config={chartConfig} className="mx-auto h-30 w-full">
          <PieChart>
            <Pie
              cx="50%"
              cy="100%"
              cornerRadius={6}
              data={gaugeSegments}
              dataKey="value"
              endAngle={0}
              innerRadius={80}
              outerRadius={110}
              paddingAngle={2}
              startAngle={180}
              stroke="var(--card)"
              strokeWidth={1}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text textAnchor="middle" x={viewBox.cx} y={viewBox.cy}>
                        <tspan
                          className="fill-foreground text-2xl font-medium tabular-nums"
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 22}
                        >
                          {availableLabel}
                        </tspan>
                        <tspan
                          className="fill-muted-foreground text-xs"
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 38}
                        >
                          {t("admin.dashboardsA.ecommerce.available")}
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
        <Separator />

        <div className="grid grid-cols-3 divide-x">
          {inventorySummary.map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-3 text-center">
              <div className="bg-muted grid size-9 place-items-center rounded-full">
                <item.icon className="text-muted-foreground size-4" />
              </div>
              <div>
                <div className="text-muted-foreground text-xs leading-none">{item.label}</div>
                <div className="text-sm font-medium tabular-nums">
                  {numberFormatter.format(item.value)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
