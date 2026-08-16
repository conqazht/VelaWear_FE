import { CalendarClock, Package, Tag, TicketPercent } from "lucide-react";

import {
  formatAdminDateTime,
  formatCurrency,
} from "@/app/(admin)/dashboard/_components/management/resource-utils";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/components/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { SaleCampaignFormValues } from "../_data/sale-campaign-form";

export function CampaignReviewStep({ values }: { values: SaleCampaignFormValues }) {
  const { locale, t } = useI18n();
  const totalQuota =
    values.type === "FLASH"
      ? values.items.reduce((sum, item) => sum + (Number(item.quota) || 0), 0)
      : null;

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="text-muted-foreground size-4" />
              {t("admin.sales.editor.review.campaign")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{values.name || t("admin.sales.editor.review.unnamed")}</p>
            <p className="text-muted-foreground mt-1 font-mono text-xs">
              {values.code || t("admin.sales.editor.review.noCode")}
            </p>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="text-muted-foreground size-4" />
              {t("admin.sales.editor.review.schedule")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{formatAdminDateTime(values.startsAt, locale)}</p>
            <p className="text-muted-foreground mt-1 text-xs">
              {t("admin.sales.editor.review.scheduleTo", {
                date: formatAdminDateTime(values.endsAt, locale),
              })}
            </p>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="text-muted-foreground size-4" />
              {t("admin.sales.editor.review.variants")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium tabular-nums">{values.items.length}</p>
            <p className="text-muted-foreground mt-1 text-xs">
              {t("admin.sales.editor.review.productCount", {
                count: new Set(values.items.map((item) => item.productId)).size,
              })}
            </p>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TicketPercent className="text-muted-foreground size-4" />
              {t("admin.sales.editor.review.rules")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={values.type === "FLASH" ? "default" : "secondary"}>
              {values.type === "FLASH"
                ? t("admin.sales.editor.type.flash")
                : t("admin.sales.editor.type.standard")}
            </Badge>
            <p className="text-muted-foreground mt-2 text-xs">
              {values.type === "FLASH"
                ? t("admin.sales.editor.review.flashRules", {
                    count: totalQuota ?? 0,
                  })
                : t("admin.sales.editor.review.standardRules")}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <Table className={values.type === "FLASH" ? "min-w-[900px]" : "min-w-[650px]"}>
          <TableHeader>
            <TableRow>
              <TableHead>{t("admin.sales.editor.review.column.productVariant")}</TableHead>
              <TableHead className="text-right">
                {t("admin.sales.editor.review.column.reference")}
              </TableHead>
              <TableHead className="text-right">
                {t("admin.sales.editor.review.column.salePrice")}
              </TableHead>
              <TableHead className="text-right">
                {t("admin.sales.editor.review.column.discount")}
              </TableHead>
              {values.type === "FLASH" ? (
                <>
                  <TableHead className="text-right">
                    {t("admin.sales.editor.review.column.quota")}
                  </TableHead>
                  <TableHead className="text-right">
                    {t("admin.sales.editor.review.column.customerLimit")}
                  </TableHead>
                </>
              ) : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {values.items.map((item) => {
              const price = Number(item.promotionalPrice);
              const percentage =
                item.referencePrice > 0 && Number.isFinite(price)
                  ? Math.round((1 - price / item.referencePrice) * 100)
                  : 0;

              return (
                <TableRow key={item.variantId}>
                  <TableCell>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-muted-foreground text-xs">
                      <span className="font-mono">{item.sku}</span>
                      {item.colorName || item.sizeName
                        ? ` · ${[item.colorName, item.sizeName].filter(Boolean).join(" / ")}`
                        : ""}
                    </p>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(item.referencePrice, locale)}
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {formatCurrency(price, locale)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{percentage}%</TableCell>
                  {values.type === "FLASH" ? (
                    <>
                      <TableCell className="text-right tabular-nums">{item.quota || "—"}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {item.maxPerCustomer || t("admin.sales.editor.review.noLimit")}
                      </TableCell>
                    </>
                  ) : null}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="bg-muted/30 rounded-xl border p-4 text-sm">
        <p className="font-medium">{t("admin.sales.editor.review.beforePublishing")}</p>
        <ul className="text-muted-foreground mt-2 list-disc space-y-1 pl-5">
          <li>{t("admin.sales.editor.review.checkOverlap")}</li>
          <li>{t("admin.sales.editor.review.checkReferencePrice")}</li>
          <li>{t("admin.sales.editor.review.checkFlashEnforcement")}</li>
        </ul>
      </div>
    </div>
  );
}
