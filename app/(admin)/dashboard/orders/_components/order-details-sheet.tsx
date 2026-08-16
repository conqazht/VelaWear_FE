"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { History, Mail, MapPin, Package, Phone, UserRound } from "lucide-react";
import { toast } from "sonner";

import { ResourceFormSheet } from "@/app/(admin)/dashboard/_components/management/resource-overlays";
import {
  getApiErrorMessage,
  resolveAdminAssetUrl,
} from "@/app/(admin)/dashboard/_components/management/resource-utils";
import { useI18n } from "@/components/providers/i18n-provider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ADMIN_ORDER_STATUSES,
  type AdminOrder,
  type AdminOrderStatus,
  type AdminOrderStatusHistoryFilters,
  type UpdateAdminOrderRequest,
} from "@/lib/api/admin-orders";
import { formatCurrency, formatDateTime } from "@/lib/i18n/format";
import {
  useAdminOrderQuery,
  useAdminOrderStatusHistoriesQuery,
  useUpdateAdminOrderMutation,
} from "@/lib/queries/admin-orders";

import {
  getOrderStatusLabel,
  getPaymentMethodLabel,
  OrderStatusBadge,
  PaymentStatusBadge,
} from "./order-status-badge";

const HISTORY_FILTERS: AdminOrderStatusHistoryFilters = {
  page: 1,
  size: 50,
  sort: "createdAt,desc",
};

type OrderDraft = {
  orderId: number;
  status: AdminOrderStatus;
};

const ORDER_STATUS_TRANSITIONS: Record<AdminOrderStatus, AdminOrderStatus[]> = {
  PENDING: ["PENDING", "CONFIRMED", "CANCELLED"],
  CONFIRMED: ["CONFIRMED", "SHIPPING", "CANCELLED"],
  SHIPPING: ["SHIPPING", "COMPLETED"],
  COMPLETED: ["COMPLETED", "REFUNDED"],
  CANCELLED: ["CANCELLED", "REFUNDED"],
  REFUNDED: ["REFUNDED"],
};

type OrderDetailsSheetProps = {
  orderId?: number;
  orderCode?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function isOrderStatus(value: string | null): value is AdminOrderStatus {
  return typeof value === "string" && ADMIN_ORDER_STATUSES.some((status) => status === value);
}

export function OrderDetailsSheet({
  orderId,
  orderCode,
  open,
  onOpenChange,
}: OrderDetailsSheetProps) {
  const { t } = useI18n();
  const [draft, setDraft] = useState<OrderDraft | null>(null);
  const orderQuery = useAdminOrderQuery(orderId, open);
  const historyQuery = useAdminOrderStatusHistoriesQuery(orderId, HISTORY_FILTERS, open);
  const updateMutation = useUpdateAdminOrderMutation();
  const order = orderQuery.data;
  const currentDraft = order
    ? draft?.orderId === order.id
      ? draft
      : { orderId: order.id, status: order.status }
    : null;
  const availableOrderStatuses = order
    ? ORDER_STATUS_TRANSITIONS[order.status].filter(
        (status) =>
          status !== "REFUNDED" ||
          order.paymentStatus === "PAID" ||
          order.paymentStatus === "REFUNDED",
      )
    : [];

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && updateMutation.isPending) return;
    if (!nextOpen) {
      setDraft(null);
      updateMutation.reset();
    }
    onOpenChange(nextOpen);
  }

  function updateDraft(patch: Partial<Pick<OrderDraft, "status">>) {
    if (!currentDraft) return;
    setDraft({ ...currentDraft, ...patch });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!order || !currentDraft || updateMutation.isPending) return;

    const request: UpdateAdminOrderRequest = {};
    if (currentDraft.status !== order.status) request.status = currentDraft.status;

    if (Object.keys(request).length === 0) {
      toast.info(t("admin.commerce.orders.details.noChanges"));
      return;
    }

    updateMutation.mutate(
      { id: order.id, request },
      {
        onSuccess: (updatedOrder) => {
          toast.success(
            t("admin.commerce.orders.details.updated", { code: updatedOrder.orderCode }),
          );
          handleOpenChange(false);
        },
        onError: (error) => {
          toast.error(getApiErrorMessage(error));
        },
      },
    );
  }

  return (
    <ResourceFormSheet
      open={open}
      onOpenChange={handleOpenChange}
      title={
        orderCode
          ? t("admin.commerce.orders.details.titleCode", { code: orderCode })
          : t("admin.commerce.orders.details.title")
      }
      description={t("admin.commerce.orders.details.description")}
      onSubmit={handleSubmit}
      isPending={orderQuery.isLoading || updateMutation.isPending}
      submitLabel={t("admin.commerce.orders.details.save")}
    >
      {orderQuery.isLoading ? <OrderDetailsSkeleton /> : null}

      {orderQuery.isError ? (
        <Alert variant="destructive">
          <AlertTitle>{t("admin.commerce.orders.details.loadError")}</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>{getApiErrorMessage(orderQuery.error)}</p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => void orderQuery.refetch()}
            >
              {t("admin.commerce.orders.details.tryAgain")}
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      {updateMutation.isError ? (
        <Alert variant="destructive">
          <AlertTitle>{t("admin.commerce.orders.details.saveError")}</AlertTitle>
          <AlertDescription>{getApiErrorMessage(updateMutation.error)}</AlertDescription>
        </Alert>
      ) : null}

      {order && currentDraft ? (
        <>
          <Alert>
            <AlertTitle>{t("admin.commerce.orders.details.workflowTitle")}</AlertTitle>
            <AlertDescription>
              {t("admin.commerce.orders.details.workflowDescription")}
            </AlertDescription>
          </Alert>
          <section className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="order-status">
                {t("admin.commerce.orders.details.orderStatus")}
              </FieldLabel>
              <Select
                value={currentDraft.status}
                onValueChange={(value) => {
                  if (isOrderStatus(value)) updateDraft({ status: value });
                }}
              >
                <SelectTrigger id="order-status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="start" alignItemWithTrigger={false}>
                  {availableOrderStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {getOrderStatusLabel(status, t)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>{t("admin.commerce.orders.details.paymentStatus")}</FieldLabel>
              <div className="flex h-9 items-center rounded-md border px-3">
                <PaymentStatusBadge status={order.paymentStatus} />
              </div>
              <p className="text-muted-foreground text-xs">
                {t("admin.commerce.orders.details.paymentReadonly")}
              </p>
            </Field>
          </section>

          <OrderOverview order={order} />
          <OrderItems order={order} />
          <OrderTotals order={order} />
          <OrderHistory order={order} query={historyQuery} />
        </>
      ) : null}
    </ResourceFormSheet>
  );
}

function OrderOverview({ order }: { order: AdminOrder }) {
  const { locale, t } = useI18n();

  return (
    <section className="space-y-3">
      <div>
        <h3 className="font-medium">{t("admin.commerce.orders.overview.title")}</h3>
        <p className="text-muted-foreground text-sm">
          {t("admin.commerce.orders.overview.placed", {
            date: formatDateTime(order.createdAt, locale),
          })}
        </p>
      </div>
      <div className="grid gap-3 rounded-lg border p-4 text-sm">
        <DetailLine
          icon={UserRound}
          label={t("admin.commerce.orders.overview.customer")}
          value={
            order.userFullName || t("admin.commerce.orders.overview.userId", { id: order.userId })
          }
        />
        <DetailLine
          icon={Mail}
          label={t("admin.commerce.orders.overview.email")}
          value={order.userEmail}
        />
        <DetailLine
          icon={UserRound}
          label={t("admin.commerce.orders.overview.receiver")}
          value={order.receiverName}
        />
        <DetailLine
          icon={Phone}
          label={t("admin.commerce.orders.overview.phone")}
          value={order.receiverPhone}
        />
        <DetailLine
          icon={MapPin}
          label={t("admin.commerce.orders.overview.address")}
          value={order.receiverAddress}
        />
      </div>
    </section>
  );
}

function DetailLine({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UserRound;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="grid grid-cols-[1rem_5rem_1fr] items-start gap-2">
      <Icon className="text-muted-foreground mt-0.5 size-4" />
      <span className="text-muted-foreground">{label}</span>
      <span className="min-w-0 font-medium break-words">{value || "—"}</span>
    </div>
  );
}

function OrderItems({ order }: { order: AdminOrder }) {
  const { locale, t } = useI18n();
  const unitCount = order.items.reduce((total, item) => total + item.quantity, 0);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-medium">{t("admin.commerce.orders.items.title")}</h3>
        <span className="text-muted-foreground text-sm tabular-nums">
          {unitCount === 1
            ? t("admin.commerce.orders.items.unitOne")
            : t("admin.commerce.orders.items.unitMany", { count: unitCount })}
        </span>
      </div>
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>{t("admin.commerce.orders.items.product")}</TableHead>
              <TableHead className="text-center">
                {t("admin.commerce.orders.items.quantity")}
              </TableHead>
              <TableHead className="text-right">
                {t("admin.commerce.orders.items.subtotal")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {order.items.length > 0 ? (
              order.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar className="size-10 rounded-md after:rounded-md">
                        <AvatarImage
                          src={resolveAdminAssetUrl(item.image)}
                          alt={item.productName}
                          className="object-cover"
                        />
                        <AvatarFallback className="rounded-md">
                          <Package className="size-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="max-w-56 truncate font-medium">{item.productName}</p>
                        <p className="text-muted-foreground max-w-56 truncate text-xs">
                          {[item.variantName, item.sku].filter(Boolean).join(" · ") || "—"}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center tabular-nums">{item.quantity}</TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {formatCurrency(item.subtotal, locale)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-muted-foreground h-20 text-center">
                  {t("admin.commerce.orders.items.empty")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

function OrderTotals({ order }: { order: AdminOrder }) {
  const { locale, t } = useI18n();

  return (
    <section className="space-y-3">
      <h3 className="font-medium">{t("admin.commerce.orders.totals.title")}</h3>
      <div className="space-y-2 rounded-lg border p-4 text-sm">
        <TotalLine label={t("admin.commerce.orders.totals.subtotal")} value={order.subtotal} />
        <TotalLine label={t("admin.commerce.orders.totals.shipping")} value={order.shippingFee} />
        <TotalLine
          label={t("admin.commerce.orders.totals.discount")}
          value={-Math.abs(order.discountAmount)}
        />
        <Separator />
        <div className="flex items-center justify-between gap-4 text-base font-semibold">
          <span>{t("admin.commerce.orders.totals.total")}</span>
          <span className="tabular-nums">{formatCurrency(order.finalAmount, locale)}</span>
        </div>
        <p className="text-muted-foreground text-right text-xs">
          {getPaymentMethodLabel(order.paymentMethod, t)}
        </p>
      </div>
    </section>
  );
}

function TotalLine({ label, value }: { label: string; value: number }) {
  const { locale } = useI18n();

  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums">{formatCurrency(value, locale)}</span>
    </div>
  );
}

function OrderHistory({
  order,
  query,
}: {
  order: AdminOrder;
  query: ReturnType<typeof useAdminOrderStatusHistoriesQuery>;
}) {
  const { locale, t } = useI18n();
  const histories = query.data?.result ?? [];

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <History className="text-muted-foreground size-4" />
        <h3 className="font-medium">{t("admin.commerce.orders.history.title")}</h3>
      </div>

      {query.isLoading ? (
        <div className="space-y-3 rounded-lg border p-4">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ) : null}

      {query.isError ? (
        <Alert variant="destructive">
          <AlertTitle>{t("admin.commerce.orders.history.unavailable")}</AlertTitle>
          <AlertDescription>{getApiErrorMessage(query.error)}</AlertDescription>
        </Alert>
      ) : null}

      {!query.isLoading && !query.isError ? (
        <div className="divide-y rounded-lg border">
          {histories.length > 0 ? (
            histories.map((history) => (
              <div key={history.id} className="space-y-2 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">
                      {history.fromStatus
                        ? `${getOrderStatusLabel(history.fromStatus, t)} →`
                        : t("admin.commerce.orders.history.createdAs")}
                    </span>
                    <OrderStatusBadge status={history.toStatus} />
                  </div>
                  <span className="text-muted-foreground text-xs">
                    {formatDateTime(history.createdAt, locale)}
                  </span>
                </div>
                {history.reason ? (
                  <p className="text-muted-foreground text-sm">{history.reason}</p>
                ) : null}
                {history.changedBy ? (
                  <p className="text-muted-foreground text-xs">
                    {t("admin.commerce.orders.history.changedBy", { id: history.changedBy })}
                  </p>
                ) : null}
              </div>
            ))
          ) : (
            <div className="text-muted-foreground p-4 text-sm">
              {t("admin.commerce.orders.history.empty", {
                status: getOrderStatusLabel(order.status, t),
              })}
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}

function OrderDetailsSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-14" />
        <Skeleton className="h-14" />
      </div>
      <Skeleton className="h-36" />
      <Skeleton className="h-52" />
      <Skeleton className="h-36" />
    </div>
  );
}
