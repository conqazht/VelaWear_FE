"use client";

import { useI18n } from "@/components/providers/i18n-provider";
import { Badge } from "@/components/ui/badge";
import type { AdminOrderStatus, AdminPaymentStatus } from "@/lib/api/admin-orders";
import { cn } from "@/lib/utils";

const orderStatusClasses: Record<AdminOrderStatus, string> = {
  PENDING: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  CONFIRMED: "border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  SHIPPING: "border-violet-500/25 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  COMPLETED: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  CANCELLED: "border-destructive/25 bg-destructive/10 text-destructive",
  REFUNDED: "border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-300",
};

const paymentStatusClasses: Record<AdminPaymentStatus, string> = {
  UNPAID: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  PAID: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  FAILED: "border-destructive/25 bg-destructive/10 text-destructive",
  REFUNDED: "border-violet-500/25 bg-violet-500/10 text-violet-700 dark:text-violet-300",
};

const ORDER_STATUS_MESSAGE_KEYS = {
  PENDING: "admin.commerce.orders.status.pending",
  CONFIRMED: "admin.commerce.orders.status.confirmed",
  SHIPPING: "admin.commerce.orders.status.shipping",
  COMPLETED: "admin.commerce.orders.status.completed",
  CANCELLED: "admin.commerce.orders.status.cancelled",
  REFUNDED: "admin.commerce.orders.status.refunded",
} as const;

const PAYMENT_STATUS_MESSAGE_KEYS = {
  UNPAID: "admin.commerce.orders.paymentStatus.unpaid",
  PAID: "admin.commerce.orders.paymentStatus.paid",
  FAILED: "admin.commerce.orders.paymentStatus.failed",
  REFUNDED: "admin.commerce.orders.paymentStatus.refunded",
} as const;

const PAYMENT_METHOD_MESSAGE_KEYS = {
  COD: "admin.commerce.orders.paymentMethod.cod",
  VNPAY: "admin.commerce.orders.paymentMethod.vnpay",
  MOMO: "admin.commerce.orders.paymentMethod.momo",
  BANK_TRANSFER: "admin.commerce.orders.paymentMethod.bankTransfer",
} as const;

type Translate = ReturnType<typeof useI18n>["t"];

export function getOrderStatusLabel(status: AdminOrderStatus, t: Translate) {
  return t(ORDER_STATUS_MESSAGE_KEYS[status]);
}

export function getPaymentStatusLabel(status: AdminPaymentStatus, t: Translate) {
  return t(PAYMENT_STATUS_MESSAGE_KEYS[status]);
}

export function getPaymentMethodLabel(value: string | null | undefined, t: Translate) {
  const normalized = value?.trim().toUpperCase();
  if (!normalized) return t("admin.commerce.orders.paymentMethod.unknown");

  const messageKey =
    PAYMENT_METHOD_MESSAGE_KEYS[normalized as keyof typeof PAYMENT_METHOD_MESSAGE_KEYS];
  return messageKey ? t(messageKey) : value?.trim() || normalized;
}

export function OrderStatusBadge({ status }: { status: AdminOrderStatus }) {
  const { t } = useI18n();

  return (
    <Badge variant="outline" className={cn("gap-1.5 rounded-sm font-medium", orderStatusClasses[status])}>
      <span className="size-1.5 rounded-full bg-current" />
      {getOrderStatusLabel(status, t)}
    </Badge>
  );
}

export function PaymentStatusBadge({ status }: { status: AdminPaymentStatus }) {
  const { t } = useI18n();

  return (
    <Badge variant="outline" className={cn("gap-1.5 rounded-sm font-medium", paymentStatusClasses[status])}>
      <span className="size-1.5 rounded-full bg-current" />
      {getPaymentStatusLabel(status, t)}
    </Badge>
  );
}
