"use client";

import { Ellipsis } from "lucide-react";

import { useI18n } from "@/components/providers/i18n-provider";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getIntlLocale } from "@/lib/i18n";

const pages = [
  { bounce: 0.24, path: "/dashboard", seconds: 192, views: 64_200 },
  { bounce: 0.31, path: "/pricing", seconds: 128, views: 41_800 },
  { bounce: 0.18, path: "/docs/getting-started", seconds: 284, views: 28_600 },
  { bounce: 0.22, path: "/blog/analytics-guide", seconds: 306, views: 19_300 },
  { bounce: 0.42, path: "/contact", seconds: 78, views: 8900 },
];

export function TopPages() {
  const { locale, t } = useI18n();
  const intlLocale = getIntlLocale(locale);
  const compactFormatter = new Intl.NumberFormat(intlLocale, {
    maximumFractionDigits: 1,
    notation: "compact",
  });
  const numberFormatter = new Intl.NumberFormat(intlLocale, { minimumIntegerDigits: 2 });
  const percentFormatter = new Intl.NumberFormat(intlLocale, { style: "percent" });

  return (
    <Card className="h-full gap-2">
      <CardHeader>
        <CardTitle className="font-normal">
          {t("admin.dashboardsA.analytics.pagePerformance")}
        </CardTitle>
        <CardAction>
          <Ellipsis className="size-4" />
        </CardAction>
      </CardHeader>

      <CardContent className="px-0">
        <Table className="[&_td:first-child]:pl-4 [&_td:last-child]:pr-4 [&_th:first-child]:pl-4 [&_th:last-child]:pr-4">
          <TableHeader className="[&_tr]:border-border/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-8" />
              <TableHead className="h-8 w-24 text-right font-normal">
                {t("admin.dashboardsA.analytics.views")}
              </TableHead>
              <TableHead className="h-8 w-24 text-right font-normal">
                {t("admin.dashboardsA.analytics.averageTime")}
              </TableHead>
              <TableHead className="h-8 w-20 text-right font-normal">
                {t("admin.dashboardsA.analytics.bounce")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="[&_tr]:border-border/50">
            {pages.map((page) => (
              <TableRow className="hover:bg-transparent" key={page.path}>
                <TableCell className="max-w-0 truncate py-4 font-medium">{page.path}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {compactFormatter.format(page.views)}
                </TableCell>
                <TableCell className="text-muted-foreground text-right tabular-nums">
                  {t("admin.dashboardsA.analytics.duration", {
                    minutes: Math.floor(page.seconds / 60),
                    seconds: numberFormatter.format(page.seconds % 60),
                  })}
                </TableCell>
                <TableCell className="text-muted-foreground text-right tabular-nums">
                  {percentFormatter.format(page.bounce)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
