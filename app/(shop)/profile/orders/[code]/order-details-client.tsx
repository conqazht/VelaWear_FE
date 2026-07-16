"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Clock3,
  CreditCard,
  LockKeyhole,
  Package,
  Truck,
} from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { StorefrontStaleWarning } from "@/components/errors/storefront-stale-warning";
import { useI18n } from "@/components/providers/i18n-provider";
import { StorefrontApiStatus } from "@/components/errors/storefront-api-status";
import { StorefrontStatus } from "@/components/errors/storefront-status";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getMyOrderByCode,
  getMyOrderStatusHistories,
} from "@/lib/api/commerce";
import { cancelOrder } from "@/lib/checkout-api";
import { formatDateTime } from "@/lib/i18n/format";
import { money } from "@/lib/vela-data";
import type { OrderItem } from "@/lib/api/types";
import { useMyReviewsQuery } from "@/lib/queries/commerce";
import { queryKeys } from "@/lib/queries/keys";
import { OrderReviewDialog } from "./order-review-dialog";

const orderHistoryParams = { size: 100, sort: "createdAt,asc" } as const;

const statusLabelKeys = {
  PENDING: "account.orders.status.pending",
  CONFIRMED: "account.orders.status.confirmed",
  PROCESSING: "account.orders.status.processing",
  SHIPPING: "account.orders.status.shipping",
  SHIPPED: "account.orders.status.shipped",
  COMPLETED: "account.orders.status.completed",
  DELIVERED: "account.orders.status.delivered",
  CANCELLED: "account.orders.status.cancelled",
  REFUNDED: "account.orders.status.refunded",
} as const;

const paymentMethodKeys = {
  COD: "account.order.paymentMethod.cod",
  SEPAY: "sale.payment.method.sepay",
  VNPAY: "account.order.paymentMethod.vnpay",
  MOMO: "account.order.paymentMethod.momo",
  BANK_TRANSFER: "account.order.paymentMethod.bankTransfer",
} as const;

const paymentStatusKeys = {
  UNPAID: "account.order.paymentStatus.unpaid",
  PENDING: "account.order.paymentStatus.pending",
  PAID: "account.order.paymentStatus.paid",
  FAILED: "account.order.paymentStatus.failed",
  REFUNDED: "account.order.paymentStatus.refunded",
  REFUND_PENDING: "sale.payment.status.refundPending",
} as const;

const statusClasses: Record<string, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  CONFIRMED: "border-blue-200 bg-blue-50 text-blue-700",
  PROCESSING: "border-violet-200 bg-violet-50 text-violet-700",
  SHIPPED: "border-sky-200 bg-sky-50 text-sky-700",
  DELIVERED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  CANCELLED: "border-red-200 bg-red-50 text-red-700",
};

const getErrorMessage = (error: unknown, fallback: string) => {
  const apiError = error as {
    response?: { data?: { message?: string } };
    message?: string;
  };
  return apiError.response?.data?.message ?? apiError.message ?? fallback;
};

export default function OrderDetailsClient({ code }: { code: string }) {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { locale, t } = useI18n();
  const queryClient = useQueryClient();
  const [reviewItem, setReviewItem] = useState<OrderItem | null>(null);
  const orderQuery = useQuery({
    queryKey: queryKeys.orders.meByCode(user?.id, code),
    queryFn: () => getMyOrderByCode(code),
    enabled: isAuthenticated && Boolean(user),
  });
  const order = orderQuery.data;
  const hasOrder = Boolean(order);
  const reviewsQuery = useMyReviewsQuery(hasOrder, {
    orderId: order?.id,
    page: 1,
    size: 100,
    sort: "createdAt,desc",
  });
  const historiesQuery = useQuery({
    queryKey: queryKeys.orders.meStatusHistories(
      user?.id,
      order?.id,
      orderHistoryParams,
    ),
    queryFn: () => getMyOrderStatusHistories(order!.id, orderHistoryParams),
    enabled: hasOrder,
  });
  const cancelMutation = useMutation({
    mutationFn: (orderId: number) => cancelOrder(orderId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
  const histories = historiesQuery.data?.result ?? [];
  const completedOrder = order?.status === "COMPLETED";
  const reviewedOrderItemIds = new Set(
    (reviewsQuery.data?.result ?? [])
      .map((review) => review.orderItemId)
      .filter((orderItemId): orderItemId is number => typeof orderItemId === "number"),
  );
  const error = cancelMutation.error
    ? getErrorMessage(cancelMutation.error, t("account.order.cancelError"))
    : null;
  const getStatusLabel = (status?: string | null) => {
    if (!status) return t("account.order.initialStatus");
    const normalizedStatus = status.toUpperCase();
    const key = statusLabelKeys[normalizedStatus as keyof typeof statusLabelKeys];
    return key ? t(key) : status;
  };
  const getPaymentMethodLabel = (method?: string | null) => {
    if (!method) return t("account.order.notAvailable");
    const normalizedMethod = method.toUpperCase();
    const key = paymentMethodKeys[normalizedMethod as keyof typeof paymentMethodKeys];
    return key ? t(key) : method;
  };
  const getPaymentStatusLabel = (status?: string | null) => {
    if (!status) return t("account.order.notAvailable");
    const normalizedStatus = status.toUpperCase();
    const key = paymentStatusKeys[normalizedStatus as keyof typeof paymentStatusKeys];
    return key ? t(key) : status;
  };
  const displayDateTime = (value?: string | null) =>
    value ? formatDateTime(value, locale) : t("account.order.notAvailable");

  const handleCancel = async () => {
    if (!order || !window.confirm(t("account.order.cancelConfirm"))) return;

    try {
      await cancelMutation.mutateAsync(order.id);
    } catch {
      // The mutation state renders the actionable message in the order page.
    }
  };

  const isPageLoading =
    isAuthLoading || (isAuthenticated && orderQuery.isLoading);

  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-canvas text-ink" aria-busy="true">
        <main className="mx-auto w-full max-w-[1280px] px-6 py-16 md:px-16">
          <OrderDetailsLoadingFallback />
        </main>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-[1800px] flex-col items-center justify-center px-6 py-24">
        <Card className="mx-auto flex max-w-md flex-col items-center rounded-sm border-[#1c1a18]/5 bg-[#efe7dc] p-8 py-10 text-center shadow-lg">
          <LockKeyhole className="mb-6 size-12 text-[#b85a3c]" />
          <h2 className="mb-4 font-serif text-2xl font-light text-[#1c1a18]">{t("account.signIn.orderTitle")}</h2>
          <p className="mb-8 text-xs leading-relaxed text-[#1c1a18]/65">
            {t("account.signIn.orderDescription")}
          </p>
          <Link href="/sign-in" className="inline-flex w-full justify-center rounded-sm bg-[#1c1a18] px-8 py-3.5 text-xs font-bold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#b85a3c]">
            {t("account.signIn.action")}
          </Link>
        </Card>
      </div>
    );
  }

  if (orderQuery.isError && !order) {
    return (
      <StorefrontApiStatus
        error={orderQuery.error}
        onRetry={() => void orderQuery.refetch()}
        resourceLabel={t("account.order.title")}
        returnHref="/profile?tab=orders"
        returnLabel={t("account.order.historyAction")}
        variant="route"
      />
    );
  }

  if (!order) {
    return (
      <StorefrontStatus
        status={404}
        eyebrow={t("account.order.notFoundEyebrow")}
        title={t("account.order.notFoundTitle")}
        description={t("account.order.notFoundDescription")}
        primaryAction={{ label: t("account.order.historyAction"), href: "/profile?tab=orders" }}
        secondaryAction={{ label: t("account.order.shopAction"), href: "/collection" }}
        variant="route"
      />
    );
  }

  if (historiesQuery.isError && histories.length === 0) {
    return (
      <StorefrontApiStatus
        error={historiesQuery.error}
        onRetry={() => void historiesQuery.refetch()}
        resourceLabel={t("account.order.historyResource")}
        returnHref="/profile?tab=orders"
        returnLabel={t("account.order.historyAction")}
        variant="route"
      />
    );
  }

  const canCancel =
    order.status === "PENDING" &&
    order.paymentStatus !== "PAID" &&
    !order.resourcesReleasedAt;

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <main className="mx-auto w-full max-w-[1280px] px-6 py-16 md:px-16">
        <Link href="/profile?tab=orders" className="mb-8 inline-flex text-xs font-semibold uppercase tracking-widest text-[#1c1a18]/55 hover:text-[#1c1a18]">← {t("account.order.back")}</Link>

        {orderQuery.isError ? (
          <StorefrontStaleWarning
            onRetry={() => void orderQuery.refetch()}
            resourceLabel={t("account.order.title")}
            className="mb-6"
          />
        ) : null}

        <header className="mb-10 flex flex-col justify-between gap-6 border-b border-[#1c1a18]/10 pb-8 md:flex-row md:items-end">
          <div>
            <h1 className="mb-4 font-serif text-3xl font-light text-[#1c1a18] md:text-5xl">{t("account.order.title")}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-[#1c1a18]/70">
              <span>{t("account.order.code", { code: order.orderCode })}</span>
              <span>•</span>
              <span>{displayDateTime(order.createdAt)}</span>
            </div>
          </div>
          <span className={`w-fit rounded-sm border px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest ${statusClasses[order.status] ?? statusClasses.PENDING}`}>
            {getStatusLabel(order.status)}
          </span>
        </header>

        {error && <div className="mb-6 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="flex flex-col gap-8 lg:col-span-8">
            <Card className="rounded-md border-none bg-white p-6 shadow-sm md:p-8">
              <h2 className="mb-6 text-xs font-bold uppercase tracking-widest text-[#1c1a18]">{t("account.order.items", { count: order.items?.length ?? 0 })}</h2>
              {completedOrder && reviewsQuery.isError ? (
                <StorefrontStaleWarning
                  onRetry={() => void reviewsQuery.refetch()}
                  resourceLabel={t("reviews.write.statusResource")}
                  className="mb-5"
                />
              ) : null}
              {order.items?.length ? (
                <div className="divide-y divide-[#1c1a18]/8">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-5 py-5 first:pt-0 last:pb-0">
                      <div className="relative flex aspect-[3/4] w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-sm bg-[#f7f4ef] md:w-24">
                        {item.image ? <Image src={item.image} alt={item.productName} fill sizes="(min-width: 768px) 96px, 80px" unoptimized className="object-cover" /> : <Package className="size-7 text-[#1c1a18]/25" />}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col justify-center">
                        <div className="flex justify-between gap-4">
                          <h3 className="font-medium text-[#1c1a18]">{item.productName}</h3>
                          <div className="text-right">
                            {item.listPrice && item.listPrice > item.price ? (
                              <span className="block text-xs text-[#1c1a18]/35 line-through">
                                {money(item.listPrice * item.quantity, locale)}
                              </span>
                            ) : null}
                            <span className="whitespace-nowrap font-medium">{money(item.subtotal, locale)}</span>
                          </div>
                        </div>
                        {item.variantName && <p className="mt-1 text-xs text-[#1c1a18]/60">{item.variantName}</p>}
                        <p className="mt-1 text-xs text-[#1c1a18]/45">
                          {t("account.order.itemDetails", {
                            sku: item.sku,
                            price: money(item.price, locale),
                            quantity: item.quantity,
                          })}
                        </p>
                        {item.priceSource && item.priceSource !== "BASE" ? (
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-[#8f2f20]">
                            <span className="rounded-full bg-[#8f2f20]/8 px-2 py-1">
                              {item.priceSource === "FLASH_SALE"
                                ? t("storefront.sale.type.flash")
                                : t("storefront.sale.type.standard")}
                            </span>
                            {item.saleCampaignName || item.saleCampaignCode ? (
                              <span>
                                {item.saleCampaignName ?? item.saleCampaignCode}
                              </span>
                            ) : null}
                          </div>
                        ) : null}
                        {completedOrder ? (
                          <div className="mt-4">
                            {reviewsQuery.isLoading && !reviewsQuery.data ? (
                              <span className="text-xs text-[#1c1a18]/45">
                                {t("reviews.write.checking")}
                              </span>
                            ) : reviewedOrderItemIds.has(item.id) ? (
                              item.productSlug ? (
                                <Link
                                  href={`/products/${encodeURIComponent(item.productSlug)}?reviews=1#reviews`}
                                  className="inline-flex min-h-9 items-center border border-emerald-200 bg-emerald-50 px-4 text-xs font-bold uppercase tracking-[0.12em] text-emerald-700"
                                >
                                  {t("reviews.write.done")}
                                </Link>
                              ) : (
                                <span className="inline-flex min-h-9 items-center border border-emerald-200 bg-emerald-50 px-4 text-xs font-bold uppercase tracking-[0.12em] text-emerald-700">
                                  {t("reviews.write.done")}
                                </span>
                              )
                            ) : !reviewsQuery.isError ? (
                              <button
                                type="button"
                                onClick={() => setReviewItem(item)}
                                className="min-h-9 border border-[#1c1a18] px-4 text-xs font-bold uppercase tracking-[0.12em] text-[#1c1a18] transition-colors hover:bg-[#1c1a18] hover:text-white"
                              >
                                {t("reviews.write.cta")}
                              </button>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-[#1c1a18]/50">{t("account.order.noItems")}</p>
              )}
              {order.items?.some((item) => item.priceSource && item.priceSource !== "BASE") ? (
                <p className="mt-6 border-t border-[#1c1a18]/8 pt-4 text-[11px] leading-5 text-[#1c1a18]/50">
                  {t("sale.order.snapshotNotice")}
                </p>
              ) : null}
            </Card>

            <Card className="rounded-md border-none bg-white p-6 shadow-sm md:p-8">
              <h2 className="mb-6 text-xs font-bold uppercase tracking-widest text-[#1c1a18]">{t("account.order.statusHistory")}</h2>
              {historiesQuery.isError ? (
                <StorefrontStaleWarning
                  onRetry={() => void historiesQuery.refetch()}
                  resourceLabel={t("account.order.historyResource")}
                  className="mb-5"
                />
              ) : null}
              <div className="space-y-5">
                <div className="flex gap-4">
                  <CheckCircle2 className="mt-0.5 size-5 text-emerald-600" />
                  <div><p className="text-sm font-medium">{t("account.order.created")}</p><p className="mt-1 text-xs text-[#1c1a18]/50">{displayDateTime(order.createdAt)}</p></div>
                </div>
                {histories.map((history) => (
                  <div key={history.id} className="flex gap-4">
                    <Clock3 className="mt-0.5 size-5 text-[#b85a3c]" />
                    <div>
                      <p className="text-sm font-medium">{t("account.order.statusChange", { from: getStatusLabel(history.fromStatus), to: getStatusLabel(history.toStatus) })}</p>
                      {history.reason && <p className="mt-1 text-xs text-[#1c1a18]/65">{history.reason}</p>}
                      <p className="mt-1 text-xs text-[#1c1a18]/50">{displayDateTime(history.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <div className="flex flex-wrap gap-3">
              {canCancel && <button type="button" disabled={cancelMutation.isPending} onClick={handleCancel} className="rounded-sm border border-red-200 px-6 py-3 text-xs font-bold uppercase tracking-widest text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50">{cancelMutation.isPending ? t("account.order.cancelling") : t("account.order.cancel")}</button>}
              <Link href="/help" className="rounded-sm border border-[#1c1a18]/20 px-6 py-3 text-xs font-bold uppercase tracking-widest text-[#1c1a18] hover:bg-[#f7f4ef]">{t("account.order.support")}</Link>
            </div>
          </div>

          <div className="flex flex-col gap-6 lg:col-span-4">
            <Card className="rounded-md border-none bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-xs font-bold uppercase tracking-widest">{t("account.order.summary")}</h2>
              <div className="mb-6 flex flex-col gap-4 border-b border-[#1c1a18]/10 pb-6 text-sm text-[#1c1a18]/70">
                <div className="flex justify-between"><span>{t("account.order.subtotal")}</span><span>{money(Number(order.subtotal ?? 0), locale)}</span></div>
                <div className="flex justify-between"><span>{t("account.order.shippingFee")}</span><span>{Number(order.shippingFee) > 0 ? money(Number(order.shippingFee), locale) : t("account.order.free")}</span></div>
                <div className="flex justify-between text-[#b85a3c]"><span>{t("account.order.discount")}</span><span>-{money(Number(order.discountAmount ?? 0), locale)}</span></div>
              </div>
              <div className="flex items-end justify-between"><span className="text-sm font-semibold">{t("account.order.total")}</span><span className="font-serif text-2xl">{money(Number(order.finalAmount ?? 0), locale)}</span></div>
            </Card>

            <Card className="rounded-md border-none bg-[#f7f4ef]/50 p-6 shadow-sm">
              <h2 className="mb-5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest"><Truck className="size-4 text-[#1c1a18]/40" aria-hidden="true" />{t("account.order.shipping")}</h2>
              <div className="space-y-1.5 text-[13px] text-[#1c1a18]/70"><p className="font-semibold text-[#1c1a18]">{order.receiverName}</p><p>{order.receiverPhone}</p><p className="pt-2 leading-relaxed">{order.receiverAddress}</p></div>
            </Card>

            <Card className="rounded-md border-none bg-[#f7f4ef]/50 p-6 shadow-sm">
              <h2 className="mb-5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest">
                <CreditCard className="size-4 text-[#1c1a18]/40" aria-hidden="true" />
                {t("account.order.payment")}
              </h2>
              <p className="text-sm font-medium">{getPaymentMethodLabel(order.paymentMethod)}</p>
              <p className="mt-1 text-xs text-[#1c1a18]/55">{getPaymentStatusLabel(order.paymentStatus)}</p>
              {order.paymentDueAt ? (
                <div className="mt-4 space-y-2 border-t border-[#1c1a18]/8 pt-4 text-xs text-[#1c1a18]/65">
                  <p className="flex items-center justify-between gap-3">
                    <span>{t("sale.order.paymentDue")}</span>
                    <strong className="text-right font-medium text-[#1c1a18]">
                      {displayDateTime(order.paymentDueAt)}
                    </strong>
                  </p>
                  {order.reservationExpiresAt ? (
                    <p className="flex items-center justify-between gap-3">
                      <span>{t("sale.order.reservationExpires")}</span>
                      <strong className="text-right font-medium text-[#1c1a18]">
                        {displayDateTime(order.reservationExpiresAt)}
                      </strong>
                    </p>
                  ) : null}
                </div>
              ) : null}
              {order.resourcesReleasedAt ? (
                <div className="mt-4 rounded-sm border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-700">
                  <p className="flex items-start gap-2 font-semibold">
                    <Clock3 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    {t("sale.order.resourcesReleasedAt", {
                      time: displayDateTime(order.resourcesReleasedAt),
                    })}
                  </p>
                  <p className="mt-1 pl-6">
                    {t("sale.order.latePaymentNotice")}
                  </p>
                </div>
              ) : order.reservationExpiresAt && order.paymentStatus !== "PAID" ? (
                <p className="mt-4 rounded-sm border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                  {t("sale.order.reservationNotice")}
                </p>
              ) : null}
            </Card>
          </div>
        </div>
      </main>
      {reviewItem ? (
        <OrderReviewDialog
          item={reviewItem}
          open
          onOpenChange={(nextOpen) => {
            if (!nextOpen) setReviewItem(null);
          }}
        />
      ) : null}
    </div>
  );
}

export function OrderDetailsLoadingFallback() {
  return (
    <div aria-hidden="true">
      <Skeleton className="mb-8 h-3 w-28" />

      <header className="mb-10 flex flex-col justify-between gap-6 border-b border-[#1c1a18]/10 pb-8 md:flex-row md:items-end">
        <div className="space-y-4">
          <Skeleton className="h-9 w-56 md:h-12 md:w-72" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="size-1 rounded-full" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
        <Skeleton className="h-8 w-24 rounded-sm" />
      </header>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="flex flex-col gap-8 lg:col-span-8">
          <Card className="rounded-md border-none bg-white p-6 shadow-sm md:p-8">
            <Skeleton className="mb-6 h-3 w-24" />
            <div className="divide-y divide-[#1c1a18]/8">
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="flex gap-5 py-5 first:pt-0 last:pb-0">
                  <Skeleton className="aspect-[3/4] w-20 flex-shrink-0 rounded-sm md:w-24" />
                  <div className="flex min-w-0 flex-1 flex-col justify-center">
                    <div className="flex justify-between gap-4">
                      <Skeleton className="h-5 w-2/5" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="mt-3 h-3 w-28" />
                    <Skeleton className="mt-2 h-3 w-4/5" />
                    <Skeleton className="mt-3 h-5 w-20 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="rounded-md border-none bg-white p-6 shadow-sm md:p-8">
            <Skeleton className="mb-6 h-3 w-32" />
            <div className="space-y-5">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex gap-4">
                  <Skeleton className="size-5 flex-shrink-0 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/5" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-10 w-32 rounded-sm" />
            <Skeleton className="h-10 w-28 rounded-sm" />
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-4">
          <Card className="rounded-md border-none bg-white p-6 shadow-sm">
            <Skeleton className="mb-6 h-3 w-24" />
            <div className="mb-6 space-y-4 border-b border-[#1c1a18]/10 pb-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between gap-4">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-24" />
                </div>
              ))}
            </div>
            <div className="flex items-end justify-between gap-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-7 w-28" />
            </div>
          </Card>

          <Card className="rounded-md border-none bg-[#f7f4ef]/50 p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <Skeleton className="size-4 rounded-sm" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-4 w-36" />
            <Skeleton className="mt-3 h-3 w-28" />
            <Skeleton className="mt-2 h-3 w-full" />
            <Skeleton className="mt-2 h-3 w-4/5" />
          </Card>

          <Card className="rounded-md border-none bg-[#f7f4ef]/50 p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <Skeleton className="size-4 rounded-sm" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-2 h-3 w-24" />
            <div className="mt-4 space-y-3 border-t border-[#1c1a18]/8 pt-4">
              <div className="flex items-center justify-between gap-4">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-28" />
              </div>
              <div className="flex items-center justify-between gap-4">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
