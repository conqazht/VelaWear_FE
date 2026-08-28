"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  CreditCard,
  HelpCircle,
  LockKeyhole,
  MapPin,
  Package,
  Phone,
  RotateCcw,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { useCart } from "@/components/shop/cart-provider";
import { StorefrontStaleWarning } from "@/components/errors/storefront-stale-warning";
import { useI18n } from "@/components/providers/i18n-provider";
import { StorefrontApiStatus } from "@/components/errors/storefront-api-status";
import { StorefrontStatus } from "@/components/errors/storefront-status";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getMyOrderByCode, getMyOrderStatusHistories } from "@/lib/api/commerce";
import { cancelOrder } from "@/lib/checkout-api";
import { formatDateTime } from "@/lib/i18n/format";
import { money, resolveImageUrl, type Product } from "@/lib/vela-data";
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
  PENDING: "border-amber-400/40 bg-amber-50 text-amber-800",
  CONFIRMED: "border-blue-400/40 bg-blue-50 text-blue-800",
  PROCESSING: "border-purple-400/40 bg-purple-50 text-purple-800",
  SHIPPED: "border-sky-400/40 bg-sky-50 text-sky-800",
  DELIVERED: "border-emerald-400/40 bg-emerald-50 text-emerald-800",
  COMPLETED: "border-emerald-400/40 bg-emerald-50 text-emerald-800",
  CANCELLED: "border-red-400/40 bg-red-50 text-red-800",
};

const paymentStatusClasses: Record<string, string> = {
  UNPAID: "border-amber-400/30 bg-amber-50 text-amber-800",
  PENDING: "border-amber-400/30 bg-amber-50 text-amber-800",
  PAID: "border-emerald-400/30 bg-emerald-50 text-emerald-800",
  FAILED: "border-red-400/30 bg-red-50 text-red-800",
  REFUNDED: "border-purple-400/30 bg-purple-50 text-purple-800",
  REFUND_PENDING: "border-orange-400/30 bg-orange-50 text-orange-800",
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
  const router = useRouter();
  const { addToCart } = useCart();
  const [reviewItem, setReviewItem] = useState<OrderItem | null>(null);
  const [isCopied, setIsCopied] = useState(false);

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
    queryKey: queryKeys.orders.meStatusHistories(user?.id, order?.id, orderHistoryParams),
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
  const canReorder = Boolean(
    order &&
    ["COMPLETED", "DELIVERED", "CANCELLED", "REFUNDED"].includes(order.status.toUpperCase()),
  );
  const reviewedOrderItemIds = new Set(
    (reviewsQuery.data?.result ?? [])
      .map((review) => review.orderItemId)
      .filter((orderItemId): orderItemId is number => typeof orderItemId === "number"),
  );
  const error = cancelMutation.error
    ? getErrorMessage(cancelMutation.error, t("account.order.cancelError"))
    : null;

  const handleReorderItem = useCallback(
    (item: OrderItem) => {
      const [color, size] = item.variantName ? item.variantName.split(" / ") : ["Default", "M"];
      const product: Product = {
        id: item.productSlug || String(item.id),
        name: item.productName,
        price: item.price,
        originalPrice: item.listPrice,
        image: item.image
          ? resolveImageUrl(item.image)
          : "/images/products/product-placeholder.webp",
        category: "",
        color: color || "Default",
        size: size || "Default",
        description: "",
        variantId: item.variantId ?? undefined,
      };
      addToCart(product, color || "Default", size || "Default");
      router.push("/checkout");
    },
    [addToCart, router],
  );

  const items = order?.items;
  const handleReorderAll = useCallback(() => {
    if (!items?.length) return;
    for (const item of items) {
      const [color, size] = item.variantName ? item.variantName.split(" / ") : ["Default", "M"];
      const product: Product = {
        id: item.productSlug || String(item.id),
        name: item.productName,
        price: item.price,
        originalPrice: item.listPrice,
        image: item.image
          ? resolveImageUrl(item.image)
          : "/images/products/product-placeholder.webp",
        category: "",
        color: color || "Default",
        size: size || "Default",
        description: "",
        variantId: item.variantId ?? undefined,
      };
      addToCart(product, color || "Default", size || "Default");
    }
    router.push("/checkout");
  }, [addToCart, items, router]);

  const orderCode = order?.orderCode;
  const handleCopyOrderCode = useCallback(() => {
    if (!orderCode) return;
    void navigator.clipboard?.writeText(orderCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }, [orderCode]);

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
    if (!order) return;

    try {
      await cancelMutation.mutateAsync(order.id);
    } catch {
      // The mutation state renders the actionable message in the order page.
    }
  };

  const isPageLoading = isAuthLoading || (isAuthenticated && orderQuery.isLoading);

  if (isPageLoading) {
    return (
      <div className="bg-canvas text-ink min-h-screen" aria-busy="true">
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
          <LockKeyhole className="mb-6 size-12 text-[#b5573a]" />
          <h2 className="mb-4 font-serif text-2xl font-light text-[#1c1a18]">
            {t("account.signIn.orderTitle")}
          </h2>
          <p className="mb-8 text-xs leading-relaxed text-[#1c1a18]/65">
            {t("account.signIn.orderDescription")}
          </p>
          <Link
            href="/sign-in"
            className="inline-flex w-full justify-center rounded-sm bg-[#1c1a18] px-8 py-3.5 text-xs font-bold tracking-[0.15em] text-white uppercase transition-colors hover:bg-[#b5573a]"
          >
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

  const canCancel = order.status === "PENDING";

  return (
    <div className="bg-canvas text-ink min-h-screen">
      <main className="mx-auto w-full max-w-[1280px] px-6 py-12 md:px-16 md:py-16">
        <div className="mb-6">
          <Link
            href="/profile?tab=orders"
            className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-[#1c1a18]/60 uppercase transition-colors hover:text-[#b5573a]"
          >
            <ArrowLeft className="size-3.5" />
            <span>{t("account.order.back")}</span>
          </Link>
        </div>

        {orderQuery.isError && order ? (
          <StorefrontStaleWarning
            onRetry={() => void orderQuery.refetch()}
            error={orderQuery.error}
            resourceLabel={t("account.order.title")}
            className="mb-6"
          />
        ) : null}

        <header className="mb-8 flex flex-col justify-between gap-4 rounded-xl border border-[#1c1a18]/8 bg-white p-6 shadow-sm sm:p-8 md:flex-row md:items-center">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-serif text-2xl font-light text-[#1c1a18] sm:text-3xl">
                {t("account.order.title")}
              </h1>
              <span
                className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold tracking-wider uppercase shadow-2xs ${statusClasses[order.status] ?? statusClasses.PENDING}`}
              >
                {getStatusLabel(order.status)}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#1c1a18]/65 sm:text-sm">
              <span>{t("account.order.code", { code: order.orderCode })}</span>
              <button
                type="button"
                onClick={handleCopyOrderCode}
                title={t("checkout.copyOrderCode")}
                className="inline-flex items-center gap-1 rounded bg-[#1c1a18]/5 px-2 py-0.5 text-xs font-medium text-[#1c1a18]/70 transition-colors hover:bg-[#1c1a18]/10 hover:text-[#1c1a18]"
              >
                {isCopied ? (
                  <>
                    <Check className="size-3 text-emerald-600" />
                    <span className="font-medium text-emerald-600">{t("checkout.copied")}</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
              <span>•</span>
              <span className="flex items-center gap-1 text-[#1c1a18]/55">
                <Calendar className="size-3.5 opacity-60" />
                {displayDateTime(order.createdAt)}
              </span>
            </div>
          </div>
          {order.items?.length && canReorder ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleReorderAll}
                className="inline-flex items-center gap-2 rounded-sm bg-[#1c1a18] px-4 py-2.5 text-xs font-bold tracking-wider text-white uppercase transition-colors hover:bg-[#b5573a]"
              >
                <RotateCcw className="size-3.5" />
                <span>{t("account.order.reorderAll")}</span>
              </button>
            </div>
          ) : null}
        </header>

        {error && (
          <div className="border-error/20 bg-error/10 text-error mb-6 rounded-md border px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Main Content (Left) */}
          <div className="flex flex-col gap-6 lg:col-span-8">
            {/* Products Card */}
            <Card className="rounded-xl border border-[#1c1a18]/8 bg-white p-6 shadow-sm md:p-8">
              <div className="mb-6 flex items-center justify-between border-b border-[#1c1a18]/8 pb-4">
                <h2 className="flex items-center gap-2 text-xs font-bold tracking-widest text-[#1c1a18] uppercase">
                  <ShoppingBag className="size-4 text-[#b5573a]" />
                  {t("account.order.items", { count: order.items?.length ?? 0 })}
                </h2>
              </div>
              {order.items?.length ? (
                <div className="divide-y divide-[#1c1a18]/8">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-4 py-5 first:pt-0 last:pb-0 sm:gap-5">
                      <div className="relative flex aspect-[3/4] w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-md border border-[#1c1a18]/8 bg-[#f7f4ef] md:w-24">
                        {item.image ? (
                          <Image
                            src={resolveImageUrl(item.image)}
                            alt={item.productName}
                            fill
                            sizes="(min-width: 768px) 96px, 80px"
                            unoptimized
                            className="object-cover"
                          />
                        ) : (
                          <Package className="size-7 text-[#1c1a18]/25" />
                        )}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
                        <div>
                          <div className="flex justify-between gap-4">
                            {item.productSlug ? (
                              <Link
                                href={`/product/${item.productSlug}`}
                                className="line-clamp-2 font-medium text-[#1c1a18] transition-colors hover:text-[#b5573a]"
                              >
                                {item.productName}
                              </Link>
                            ) : (
                              <h3 className="line-clamp-2 font-medium text-[#1c1a18]">
                                {item.productName}
                              </h3>
                            )}
                            <div className="shrink-0 text-right">
                              {item.listPrice && item.listPrice > item.price ? (
                                <span className="block text-xs text-[#1c1a18]/40 line-through">
                                  {money(item.listPrice * item.quantity, locale)}
                                </span>
                              ) : null}
                              <span className="font-numeric text-sm font-semibold whitespace-nowrap text-[#1c1a18] sm:text-base">
                                {money(item.subtotal, locale)}
                              </span>
                            </div>
                          </div>
                          {item.variantName && (
                            <p className="mt-1 inline-block rounded bg-[#1c1a18]/5 px-2 py-0.5 text-[11px] font-medium text-[#1c1a18]/70">
                              {item.variantName}
                            </p>
                          )}
                          <p className="mt-1.5 text-xs text-[#1c1a18]/50">
                            {t("account.order.itemDetails", {
                              sku: item.sku,
                              price: money(item.price, locale),
                              quantity: item.quantity,
                            })}
                          </p>
                        </div>
                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          {canReorder ? (
                            <button
                              type="button"
                              onClick={() => handleReorderItem(item)}
                              className="inline-flex items-center gap-1.5 rounded-sm border border-[#1c1a18]/20 bg-white px-3 py-1.5 text-xs font-semibold tracking-wider text-[#1c1a18] uppercase transition-colors hover:border-[#1c1a18] hover:bg-[#efe7dc]"
                            >
                              <RotateCcw className="size-3.5" />
                              <span>{t("account.order.buyAgain")}</span>
                            </button>
                          ) : null}

                          {completedOrder ? (
                            reviewsQuery.isLoading && !reviewsQuery.data ? (
                              <span className="text-xs text-[#1c1a18]/45">
                                {t("reviews.write.checking")}
                              </span>
                            ) : reviewedOrderItemIds.has(item.id) ? (
                              item.productSlug ? (
                                <Link
                                  href={`/product/${item.productSlug}?tab=reviews`}
                                  className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 hover:text-emerald-800"
                                >
                                  <CheckCircle2 className="size-3.5 shrink-0" />
                                  <span>{t("reviews.write.done")}</span>
                                </Link>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                                  <CheckCircle2 className="size-3.5 shrink-0" />
                                  <span>{t("reviews.write.done")}</span>
                                </span>
                              )
                            ) : (
                              <button
                                type="button"
                                onClick={() => setReviewItem(item)}
                                className="inline-flex items-center rounded-sm border border-[#1c1a18]/20 bg-white px-3 py-1.5 text-xs font-semibold tracking-wider text-[#1c1a18] uppercase transition-colors hover:border-[#1c1a18] hover:bg-[#efe7dc]"
                              >
                                {t("reviews.write.cta")}
                              </button>
                            )
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-[#1c1a18]/50">
                  {t("account.order.noItems")}
                </p>
              )}
            </Card>

            {/* Status History Card */}
            <Card className="rounded-xl border border-[#1c1a18]/8 bg-white p-6 shadow-sm md:p-8">
              <div className="mb-6 flex items-center justify-between border-b border-[#1c1a18]/8 pb-4">
                <h2 className="flex items-center gap-2 text-xs font-bold tracking-widest text-[#1c1a18] uppercase">
                  <Clock3 className="size-4 text-[#b5573a]" />
                  {t("account.order.statusHistory")}
                </h2>
              </div>
              {historiesQuery.isError ? (
                <StorefrontStaleWarning
                  onRetry={() => void historiesQuery.refetch()}
                  resourceLabel={t("account.order.historyResource")}
                  className="mb-5"
                />
              ) : null}
              <div className="relative space-y-1 pl-1">
                <div className="relative flex gap-4">
                  <div className="relative flex flex-col items-center">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600">
                      <CheckCircle2 className="size-4" />
                    </div>
                    {histories.length > 0 && <div className="my-1 w-0.5 flex-1 bg-[#1c1a18]/10" />}
                  </div>
                  <div className="pt-0.5 pb-5">
                    <p className="text-sm font-semibold text-[#1c1a18]">
                      {t("account.order.created")}
                    </p>
                    <p className="mt-0.5 text-xs text-[#1c1a18]/50">
                      {displayDateTime(order.createdAt)}
                    </p>
                  </div>
                </div>
                {histories.map((history, idx) => {
                  const isLast = idx === histories.length - 1;
                  return (
                    <div key={history.id} className="relative flex gap-4">
                      <div className="relative flex flex-col items-center">
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-full border border-[#b5573a]/20 bg-[#b5573a]/10 text-[#b5573a]">
                          <Clock3 className="size-3.5" />
                        </div>
                        {!isLast && <div className="my-1 w-0.5 flex-1 bg-[#1c1a18]/10" />}
                      </div>
                      <div className="pt-0.5 pb-5">
                        <p className="text-sm font-semibold text-[#1c1a18]">
                          {t("account.order.statusChange", {
                            from: getStatusLabel(history.fromStatus),
                            to: getStatusLabel(history.toStatus),
                          })}
                        </p>
                        {history.reason && (
                          <p className="mt-0.5 text-xs text-[#1c1a18]/65">{history.reason}</p>
                        )}
                        <p className="mt-0.5 text-xs text-[#1c1a18]/50">
                          {displayDateTime(history.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-1">
              {canCancel && (
                <AlertDialog>
                  <AlertDialogTrigger className="border-error/30 text-error hover:bg-error/10 cursor-pointer rounded-md border px-5 py-2.5 text-xs font-semibold tracking-wider uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-50">
                    {cancelMutation.isPending
                      ? t("account.order.cancelling")
                      : t("account.order.cancel")}
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-canvas max-w-md rounded-xl border-[#1c1a18]/10">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-ink font-serif text-xl font-light">
                        {t("account.order.cancelTitle")}
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-ink/70 text-sm">
                        {t("account.order.cancelDescription")}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-6">
                      <AlertDialogCancel className="text-ink rounded-md border-[#1c1a18]/20 hover:bg-[#1c1a18]/5">
                        {t("account.order.cancelDismiss")}
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleCancel}
                        disabled={cancelMutation.isPending}
                        className="bg-error hover:bg-error/90 rounded-md border-0 text-white"
                      >
                        {cancelMutation.isPending
                          ? t("account.order.cancelling")
                          : t("account.order.cancelAction")}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <Link
                href="/help"
                className="inline-flex items-center gap-1.5 rounded-md border border-[#1c1a18]/20 px-5 py-2.5 text-xs font-semibold tracking-wider text-[#1c1a18] uppercase transition-colors hover:bg-[#1c1a18]/5"
              >
                <HelpCircle className="size-3.5" />
                <span>{t("account.order.support")}</span>
              </Link>
            </div>
          </div>

          {/* Sidebar (Right) */}
          <div className="flex flex-col gap-6 lg:col-span-4">
            {/* Total Summary Card */}
            <Card className="rounded-xl border border-[#1c1a18]/8 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xs font-bold tracking-widest text-[#1c1a18] uppercase">
                {t("account.order.summary")}
              </h2>
              <div className="mb-5 flex flex-col gap-3.5 border-b border-[#1c1a18]/8 pb-5 text-xs text-[#1c1a18]/70 sm:text-sm">
                <div className="flex items-center justify-between">
                  <span>{t("account.order.subtotal")}</span>
                  <span className="font-numeric font-medium text-[#1c1a18]">
                    {money(Number(order.subtotal ?? 0), locale)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{t("account.order.shippingFee")}</span>
                  <span className="font-numeric font-medium text-[#1c1a18]">
                    {Number(order.shippingFee) > 0
                      ? money(Number(order.shippingFee), locale)
                      : t("account.order.free")}
                  </span>
                </div>
                {Number(order.discountAmount) > 0 && (
                  <div className="flex items-center justify-between text-[#b5573a]">
                    <span>{t("account.order.discount")}</span>
                    <span className="font-numeric font-medium">
                      -{money(Number(order.discountAmount ?? 0), locale)}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-sm font-semibold text-[#1c1a18]">
                  {t("account.order.total")}
                </span>
                <span className="font-serif text-2xl font-semibold text-[#b5573a]">
                  {money(Number(order.finalAmount ?? 0), locale)}
                </span>
              </div>
            </Card>

            {/* Shipping Info Card */}
            <Card className="rounded-xl border border-[#1c1a18]/8 bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-xs font-bold tracking-widest text-[#1c1a18] uppercase">
                <Truck className="size-4 text-[#b5573a]" aria-hidden="true" />
                {t("account.order.shipping")}
              </h2>
              <div className="space-y-2 text-xs text-[#1c1a18]/70 sm:text-sm">
                <p className="text-sm font-semibold text-[#1c1a18]">{order.receiverName}</p>
                <p className="flex items-center gap-1.5 text-xs text-[#1c1a18]/80">
                  <Phone className="size-3.5 shrink-0 text-[#1c1a18]/40" />
                  <span>{order.receiverPhone}</span>
                </p>
                <p className="mt-2 flex items-start gap-1.5 border-t border-[#1c1a18]/6 pt-2 text-xs leading-relaxed text-[#1c1a18]/70">
                  <MapPin className="mt-0.5 size-3.5 shrink-0 text-[#1c1a18]/40" />
                  <span>{order.receiverAddress}</span>
                </p>
              </div>
            </Card>

            {/* Payment Details Card */}
            <Card className="rounded-xl border border-[#1c1a18]/8 bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-xs font-bold tracking-widest text-[#1c1a18] uppercase">
                <CreditCard className="size-4 text-[#b5573a]" aria-hidden="true" />
                {t("account.order.payment")}
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-[#1c1a18]/60">{t("checkout.payment")}</span>
                  <span className="text-xs font-semibold text-[#1c1a18]">
                    {getPaymentMethodLabel(order.paymentMethod)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-[#1c1a18]/60">{t("checkout.status")}</span>
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                      paymentStatusClasses[order.paymentStatus?.toUpperCase() ?? ""] ??
                      "border-[#1c1a18]/15 bg-[#1c1a18]/5 text-[#1c1a18]/75"
                    }`}
                  >
                    {getPaymentStatusLabel(order.paymentStatus)}
                  </span>
                </div>

                {order.paymentDueAt ? (
                  <div className="mt-4 space-y-2 border-t border-[#1c1a18]/8 pt-3 text-xs text-[#1c1a18]/65">
                    <p className="flex items-center justify-between gap-3">
                      <span>{t("sale.order.paymentDue")}</span>
                      <strong className="text-right font-mono font-medium text-[#1c1a18]">
                        {displayDateTime(order.paymentDueAt)}
                      </strong>
                    </p>
                    {order.reservationExpiresAt ? (
                      <p className="flex items-center justify-between gap-3">
                        <span>{t("sale.order.reservationExpires")}</span>
                        <strong className="text-right font-mono font-medium text-[#1c1a18]">
                          {displayDateTime(order.reservationExpiresAt)}
                        </strong>
                      </p>
                    ) : null}
                  </div>
                ) : null}

                {order.resourcesReleasedAt ? (
                  <div className="mt-3 rounded-lg border border-red-200 bg-red-50/80 p-3 text-xs leading-relaxed text-red-800">
                    <p className="flex items-start gap-1.5 font-semibold">
                      <Clock3 className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                      <span>
                        {t("sale.order.resourcesReleasedAt", {
                          time: displayDateTime(order.resourcesReleasedAt),
                        })}
                      </span>
                    </p>
                    <p className="mt-1 pl-5 text-[11px] text-red-700/80">
                      {t("sale.order.latePaymentNotice")}
                    </p>
                  </div>
                ) : order.reservationExpiresAt && order.paymentStatus !== "PAID" ? (
                  <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50/80 p-3 text-xs leading-relaxed text-amber-900">
                    <p className="text-[11px] text-amber-800">
                      {t("sale.order.reservationNotice")}
                    </p>
                  </div>
                ) : null}
              </div>
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
