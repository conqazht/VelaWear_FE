"use client";

import { ArrowUpRight } from "lucide-react";

import { useI18n } from "@/components/providers/i18n-provider";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getIntlLocale } from "@/lib/i18n";

const categories = [
  {
    name: "Apparel",
    share: 44,
    color: "var(--chart-3)",
  },
  {
    name: "Accessories",
    share: 32,
    color: "var(--chart-2)",
  },
  {
    name: "Home",
    share: 24,
    color: "var(--chart-1)",
  },
] as const;

const products = [
  {
    name: "Linen Overshirt",
    category: "Apparel",
    share: 0.31,
    sales: 14_820,
  },
  {
    name: "Everyday Tote",
    category: "Accessories",
    share: 0.24,
    sales: 11_460,
  },
  {
    name: "Ceramic Planter",
    category: "Home",
    share: 0.18,
    sales: 8930,
  },
] as const;

export function TopProducts() {
  const { locale, t } = useI18n();
  const intlLocale = getIntlLocale(locale);
  const currencyFormatter = new Intl.NumberFormat(intlLocale, {
    currency: "USD",
    maximumFractionDigits: 0,
    style: "currency",
  });
  const percentFormatter = new Intl.NumberFormat(intlLocale, { style: "percent" });
  const categoryLabels: Record<string, string> = {
    Accessories: t("admin.dashboardsA.ecommerce.accessories"),
    Apparel: t("admin.dashboardsA.ecommerce.apparel"),
    Home: t("admin.dashboardsA.ecommerce.home"),
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-normal text-muted-foreground text-sm">
          {t("admin.dashboardsA.ecommerce.topProducts")}
        </CardTitle>
        <CardDescription className="text-foreground text-xl tabular-nums leading-none tracking-tight">
          {t("admin.dashboardsA.ecommerce.salesShare", { percent: percentFormatter.format(0.73) })}
        </CardDescription>
        <CardAction>
          <ArrowUpRight className="size-4" />
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div
            aria-label={t("admin.dashboardsA.ecommerce.salesByCategory")}
            className="flex h-2 gap-1 overflow-hidden bg-muted"
            role="img"
          >
            {categories.map((category) => (
              <div
                aria-hidden="true"
                key={category.name}
                className="rounded-md"
                style={{
                  backgroundColor: category.color,
                  width: `${category.share}%`,
                }}
              />
            ))}
          </div>

          <div className="flex flex-wrap gap-4">
            {categories.map((category) => (
              <div className="flex items-center gap-1" key={category.name}>
                <span aria-hidden="true" className="size-2 rounded-full" style={{ backgroundColor: category.color }} />
                <span className="text-muted-foreground text-xs">
                  {categoryLabels[category.name] ?? category.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 gap-y-3">
          <div className="text-muted-foreground text-xs">{t("admin.dashboardsA.ecommerce.products")}</div>
          <div className="text-muted-foreground text-xs">{t("admin.dashboardsA.ecommerce.share")}</div>
          <div className="text-muted-foreground text-xs">{t("admin.dashboardsA.ecommerce.sales")}</div>

          {products.map((product) => (
            <div className="contents text-sm" key={product.name}>
              <div className="min-w-0">
                <div className="truncate font-medium">{product.name}</div>
                <div className="text-muted-foreground text-xs">
                  {categoryLabels[product.category] ?? product.category}
                </div>
              </div>
              <div className="self-center text-muted-foreground tabular-nums">
                {percentFormatter.format(product.share)}
              </div>
              <div className="self-center font-medium tabular-nums">{currencyFormatter.format(product.sales)}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
