"use client";

import * as React from "react";

import { Label, Pie, PieChart } from "recharts";

import { useI18n } from "@/components/providers/i18n-provider";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, formatNumber } from "@/lib/i18n/format";

type BalanceKey = "investment" | "main" | "reserve" | "savings";

const balanceData: {
  amount: number;
  key: BalanceKey;
  percentage: number;
}[] = [
  {
    amount: 122_540,
    key: "main",
    percentage: 52.2,
  },
  {
    amount: 48_320,
    key: "savings",
    percentage: 20.6,
  },
  {
    amount: 36_780,
    key: "investment",
    percentage: 15.7,
  },
  {
    amount: 27_256,
    key: "reserve",
    percentage: 11.5,
  },
];

const balanceColors: Record<BalanceKey, string> = {
  investment: "var(--chart-1)",
  main: "var(--chart-2)",
  reserve: "var(--chart-3)",
  savings: "var(--chart-4)",
};

const currencies = ["EUR", "GBP", "USD"] as const;

type Currency = (typeof currencies)[number];

const totalBalance = balanceData.reduce((total, item) => total + item.amount, 0);

export function BalanceDistributionCard() {
  const { locale, t } = useI18n();
  const [currency, setCurrency] = React.useState<Currency>("USD");
  const accountLabels = {
    investment: t("admin.finance.allocation.investment"),
    main: t("admin.finance.allocation.main"),
    reserve: t("admin.finance.allocation.reserve"),
    savings: t("admin.finance.allocation.savings"),
  } satisfies Record<BalanceKey, string>;
  const chartConfig = {
    amount: { label: t("admin.finance.allocation.balance") },
    investment: { color: balanceColors.investment, label: accountLabels.investment },
    main: { color: balanceColors.main, label: accountLabels.main },
    reserve: { color: balanceColors.reserve, label: accountLabels.reserve },
    savings: { color: balanceColors.savings, label: accountLabels.savings },
  } satisfies ChartConfig;
  const chartData = balanceData.map((item) => ({
    ...item,
    account: accountLabels[item.key],
    fill: balanceColors[item.key],
  }));
  const currencyLabels: Record<Currency, string> = {
    EUR: t("admin.finance.currency.eur"),
    GBP: t("admin.finance.currency.gbp"),
    USD: t("admin.finance.currency.usd"),
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-normal">{t("admin.finance.allocation.title")}</CardTitle>
        <CardAction>
          <Select onValueChange={(value) => setCurrency(value as Currency)} value={currency}>
            <SelectTrigger className="w-36" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {currencies.map((value) => (
                  <SelectItem key={value} value={value}>
                    {currencyLabels[value]}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>

      <CardContent className="grid items-center gap-4 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)]">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square h-50">
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel className="w-52" nameKey="account" />}
            />
            <Pie
              cornerRadius={6}
              data={chartData}
              dataKey="amount"
              innerRadius={65}
              nameKey="account"
              outerRadius={90}
              paddingAngle={2}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (!(viewBox && "cx" in viewBox && "cy" in viewBox)) {
                    return null;
                  }

                  return (
                    <text dominantBaseline="middle" textAnchor="middle" x={viewBox.cx} y={viewBox.cy}>
                      <tspan className="fill-muted-foreground text-xs" x={viewBox.cx} y={(viewBox.cy ?? 0) - 8}>
                        {t("admin.finance.allocation.total")}
                      </tspan>
                      <tspan
                        className="fill-foreground font-heading font-medium text-lg tabular-nums"
                        x={viewBox.cx}
                        y={(viewBox.cy ?? 0) + 14}
                      >
                        {formatCurrency(totalBalance, locale, currency)}
                      </tspan>
                    </text>
                  );
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>

        <div className="flex min-w-0 flex-col gap-3">
          {chartData.map((item) => (
            <div className="grid grid-cols-[1fr_auto] items-end gap-3" key={item.key}>
              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-1">
                  <span aria-hidden="true" className="h-2 w-1 rounded-full" style={{ backgroundColor: item.fill }} />
                  <p className="truncate text-muted-foreground text-xs">{item.account}</p>
                </div>
                <p className="font-medium tabular-nums">
                  {formatCurrency(item.amount, locale, currency)}
                </p>
              </div>
              <div className="font-medium tabular-nums">{formatNumber(item.percentage / 100, locale, { style: "percent", maximumFractionDigits: 1 })}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
