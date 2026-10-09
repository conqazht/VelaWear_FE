"use client";

import Link from "next/link";
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
import type { InventorySummary } from "@/lib/api/admin-dashboard";
import { formatNumber } from "@/lib/i18n/format";

type InventoryProps = {
  inventory?: InventorySummary;
};

const gaugeSegmentCount = 32;

export function Inventory({ inventory }: InventoryProps) {
  const { locale, t } = useI18n();

  const total = inventory?.totalVariants ?? 0;
  const inStock = inventory?.inStockCount ?? 0;
  const lowStock = inventory?.lowStockCount ?? 0;
  const outOfStock = inventory?.outOfStockCount ?? 0;

  const availablePercent = total > 0 ? Math.round((inStock / total) * 100) : 0;
  const availableLabel = `${availablePercent}%`;

  const inStockSegments = total > 0 ? Math.round((inStock / total) * gaugeSegmentCount) : 0;
  const lowStockSegments = total > 0 ? Math.round((lowStock / total) * gaugeSegmentCount) : 0;

  const gaugeSegments = Array.from({ length: gaugeSegmentCount }, (_, index) => {
    let status = "out-of-stock";
    if (index < inStockSegments) {
      status = "in-stock";
    } else if (index < inStockSegments + lowStockSegments) {
      status = "low-stock";
    }
    return {
      fill: `var(--color-${status})`,
      id: `segment-${index + 1}`,
      status,
      value: 1,
    };
  });

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

  const inventorySummary = [
    {
      icon: PackageCheck,
      label: t("admin.dashboardsA.ecommerce.inStock"),
      value: inStock,
      color: "text-emerald-600 dark:text-emerald-400",
    },
    {
      icon: TriangleAlert,
      label: t("admin.dashboardsA.ecommerce.lowStock"),
      value: lowStock,
      color: "text-amber-600 dark:text-amber-400",
    },
    {
      icon: PackageX,
      label: t("admin.dashboardsA.ecommerce.out"),
      value: outOfStock,
      color: "text-rose-600 dark:text-rose-400",
    },
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-muted-foreground text-sm font-normal">
          {t("admin.dashboardsA.ecommerce.inventory")}
        </CardTitle>
        <CardDescription className="text-foreground text-xl leading-none font-bold tracking-tight tabular-nums">
          {t("admin.dashboardsA.ecommerce.availablePercent", { percent: availableLabel })}
        </CardDescription>
        <CardAction>
          <Link
            href="/dashboard/products"
            className="text-muted-foreground hover:text-foreground transition-colors"
            title={locale === "vi" ? "Quản lý kho" : "Manage inventory"}
          >
            <ArrowUpRight className="size-4" />
          </Link>
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
                          className="fill-foreground text-2xl font-bold tabular-nums"
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

        <div className="flex flex-col gap-2.5">
          {inventorySummary.map((item) => (
            <div className="flex items-center justify-between text-sm" key={item.label}>
              <div className="flex items-center gap-2">
                <item.icon className={`size-4 ${item.color}`} />
                <span className="text-muted-foreground text-xs">{item.label}</span>
              </div>
              <span className="font-semibold tabular-nums">{formatNumber(item.value, locale)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
