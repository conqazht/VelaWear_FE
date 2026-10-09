"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, CreditCard, ChevronRight } from "lucide-react";

import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { OrderDetailsSheet } from "@/app/(admin)/dashboard/orders/_components/order-details-sheet";
import {
  PaymentStatusBadge,
  getPaymentMethodLabel,
} from "@/app/(admin)/dashboard/orders/_components/order-status-badge";
import type { AdminPaymentStatus } from "@/lib/api/admin-orders";
import type { RecentPaymentTransaction } from "@/lib/api/admin-dashboard";
import { formatCurrency, formatDateTime } from "@/lib/i18n/format";

type UpcomingTransactionsProps = {
  recentTransactions?: RecentPaymentTransaction[];
};

export const UpcomingTransactions = React.memo(function UpcomingTransactions({
  recentTransactions = [],
}: UpcomingTransactionsProps) {
  const { locale, t } = useI18n();
  const [selectedOrder, setSelectedOrder] = React.useState<{
    id: number;
    orderCode: string;
  } | null>(null);

  return (
    <>
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">
                {locale === "vi" ? "Giao dịch thanh toán gần nhất" : "Recent Payment Transactions"}
              </CardTitle>
              <CardDescription className="text-xs">
                {locale === "vi"
                  ? "10 đơn hàng thanh toán phát sinh mới nhất (click để xem chi tiết / in hóa đơn)"
                  : "Latest 10 order payment transactions (click to view details or print invoice)"}
              </CardDescription>
            </div>
            <CardAction>
              <Button
                aria-label={t("admin.dashboardsA.ecommerce.openOrders")}
                size="icon-sm"
                variant="outline"
                render={
                  <Link
                    href="/dashboard/orders"
                    title={locale === "vi" ? "Xem tất cả đơn hàng" : "View all orders"}
                  >
                    <ArrowUpRight className="size-4" />
                  </Link>
                }
              />
            </CardAction>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {recentTransactions.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center text-sm">
              {locale === "vi" ? "Chưa có giao dịch gần đây" : "No recent transactions"}
            </div>
          ) : (
            <ItemGroup className="gap-2">
              {recentTransactions.map((tx) => (
                <Item
                  key={tx.orderId}
                  variant="outline"
                  size="sm"
                  className="hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => setSelectedOrder({ id: tx.orderId, orderCode: tx.orderCode })}
                >
                  <ItemMedia>
                    <div className="bg-background text-muted-foreground grid size-9 place-items-center rounded-md border">
                      <CreditCard className="size-4" />
                    </div>
                  </ItemMedia>
                  <ItemContent>
                    <div className="flex items-center gap-2">
                      <ItemTitle className="text-foreground font-medium">#{tx.orderCode}</ItemTitle>
                      <PaymentStatusBadge status={tx.paymentStatus as AdminPaymentStatus} />
                    </div>
                    <ItemDescription className="text-xs">
                      {tx.customerName} • {getPaymentMethodLabel(tx.paymentMethod, t)} •{" "}
                      {formatDateTime(tx.createdAt, locale)}
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions className="flex items-center gap-2">
                    <span className="text-foreground text-sm font-semibold tabular-nums">
                      {formatCurrency(tx.finalAmount, locale)}
                    </span>
                    <ChevronRight className="text-muted-foreground size-4" />
                  </ItemActions>
                </Item>
              ))}
            </ItemGroup>
          )}
        </CardContent>
      </Card>

      <OrderDetailsSheet
        orderId={selectedOrder?.id}
        orderCode={selectedOrder?.orderCode}
        open={selectedOrder !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedOrder(null);
        }}
      />
    </>
  );
});
