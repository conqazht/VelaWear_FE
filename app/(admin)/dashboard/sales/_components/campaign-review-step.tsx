import { CalendarClock, Package, Tag, TicketPercent } from "lucide-react";

import {
  formatAdminDateTime,
  formatCurrency,
} from "@/app/(admin)/dashboard/_components/management/resource-utils";
import { Badge } from "@/components/ui/badge";
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

export function CampaignReviewStep({
  values,
}: {
  values: SaleCampaignFormValues;
}) {
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
              <Tag className="size-4 text-muted-foreground" /> Campaign
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{values.name || "Unnamed campaign"}</p>
            <p className="mt-1 font-mono text-muted-foreground text-xs">
              {values.code || "NO_CODE"}
            </p>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="size-4 text-muted-foreground" /> Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{formatAdminDateTime(values.startsAt)}</p>
            <p className="mt-1 text-muted-foreground text-xs">
              to {formatAdminDateTime(values.endsAt)}
            </p>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="size-4 text-muted-foreground" /> Variants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium tabular-nums">{values.items.length}</p>
            <p className="mt-1 text-muted-foreground text-xs">
              across {new Set(values.items.map((item) => item.productId)).size} product(s)
            </p>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TicketPercent className="size-4 text-muted-foreground" /> Rules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={values.type === "FLASH" ? "default" : "secondary"}>
              {values.type === "FLASH" ? "Flash sale" : "Standard sale"}
            </Badge>
            <p className="mt-2 text-muted-foreground text-xs">
              {values.type === "FLASH"
                ? `${totalQuota ?? 0} total quota · coupons excluded`
                : "No quota · eligible coupons may apply"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <Table className={values.type === "FLASH" ? "min-w-[900px]" : "min-w-[650px]"}>
          <TableHeader>
            <TableRow>
              <TableHead>Product / variant</TableHead>
              <TableHead className="text-right">Reference</TableHead>
              <TableHead className="text-right">Sale price</TableHead>
              <TableHead className="text-right">Discount</TableHead>
              {values.type === "FLASH" ? (
                <>
                  <TableHead className="text-right">Quota</TableHead>
                  <TableHead className="text-right">Customer limit</TableHead>
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
                    {formatCurrency(item.referencePrice)}
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {formatCurrency(price)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{percentage}%</TableCell>
                  {values.type === "FLASH" ? (
                    <>
                      <TableCell className="text-right tabular-nums">
                        {item.quota || "—"}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {item.maxPerCustomer || "No limit"}
                      </TableCell>
                    </>
                  ) : null}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="rounded-xl border bg-muted/30 p-4 text-sm">
        <p className="font-medium">Before publishing</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
          <li>The backend validates schedule overlap again inside a transaction.</li>
          <li>Reference prices are snapshotted when the campaign is published.</li>
          <li>Flash quota and per-customer limits are enforced by the database at checkout.</li>
        </ul>
      </div>
    </div>
  );
}
