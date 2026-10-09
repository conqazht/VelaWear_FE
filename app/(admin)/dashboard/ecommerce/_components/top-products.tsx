"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, Package } from "lucide-react";

import { useI18n } from "@/components/providers/i18n-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { TopProductSummary } from "@/lib/api/admin-dashboard";
import { formatCurrency, formatNumber } from "@/lib/i18n/format";
import { resolveAdminAssetUrl } from "@/app/(admin)/dashboard/_components/management/resource-utils";

type TopProductsProps = {
  topProducts?: TopProductSummary[];
};

export const TopProducts = React.memo(function TopProducts({ topProducts = [] }: TopProductsProps) {
  const { locale, t } = useI18n();

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-muted-foreground text-sm font-normal">
          {t("admin.dashboardsA.ecommerce.topProducts")}
        </CardTitle>
        <CardDescription className="text-foreground text-xl leading-none font-bold tracking-tight tabular-nums">
          {locale === "vi" ? "Sản phẩm bán chạy nhất" : "Top Best Sellers"}
        </CardDescription>
        <CardAction>
          <Link
            href="/dashboard/products"
            className="text-muted-foreground hover:text-foreground transition-colors"
            title={locale === "vi" ? "Xem tất cả sản phẩm" : "View all products"}
          >
            <ArrowUpRight className="size-4" />
          </Link>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {topProducts.length > 0 ? (
          <div className="flex flex-col divide-y">
            {topProducts.map((product, idx) => (
              <div
                key={product.productName + idx}
                className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar className="size-9 rounded-md border">
                    <AvatarImage
                      src={resolveAdminAssetUrl(product.image) ?? undefined}
                      alt={product.productName}
                      className="object-cover"
                    />
                    <AvatarFallback className="rounded-md text-xs">
                      {product.productName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-foreground truncate text-sm font-medium">
                      {product.productName}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {locale === "vi" ? "Đã bán: " : "Sold: "}
                      <span className="text-foreground font-semibold">
                        {formatNumber(product.soldQuantity, locale)}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="text-right text-xs">
                  <p className="text-foreground font-mono font-semibold">
                    {formatCurrency(product.totalRevenue, locale)}
                  </p>
                  <p className="text-muted-foreground text-[11px]">
                    {locale === "vi" ? "Doanh thu" : "Revenue"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground flex h-44 flex-col items-center justify-center gap-2 text-center text-sm">
            <Package className="text-muted-foreground/60 size-6" />
            <p>{locale === "vi" ? "Chưa có dữ liệu bán hàng" : "No sales data recorded yet"}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
