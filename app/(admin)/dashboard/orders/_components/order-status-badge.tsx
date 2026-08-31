"use client";

import { useI18n } from "@/components/providers/i18n-provider";
import { Badge } from "@/components/ui/badge";
import type { AdminOrderStatus, AdminPaymentStatus } from "@/lib/api/admin-orders";
import { cn } from "@/lib/utils";

const orderStatusClasses: Record<AdminOrderStatus, string> = {
  PENDING:
    "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300",
  CONFIRMED:
    "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800/60 dark:bg-blue-950/40 dark:text-blue-300",
  SHIPPING:
    "border-indigo-200 bg-indigo-50 text-indigo-800 dark:border-indigo-800/60 dark:bg-indigo-950/40 dark:text-indigo-300",
  COMPLETED:
    "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300",
  CANCELLED:
    "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800/60 dark:bg-rose-950/40 dark:text-rose-300",
  REFUNDED:
    "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300",
};

const paymentStatusClasses: Record<AdminPaymentStatus, string> = {
  UNPAID:
    "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300",
  PAID: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300",
  FAILED:
    "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800/60 dark:bg-rose-950/40 dark:text-rose-300",
  REFUNDED:
    "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300",
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
    <Badge
      variant="outline"
      className={cn("gap-1.5 rounded-sm font-medium", orderStatusClasses[status])}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {getOrderStatusLabel(status, t)}
    </Badge>
  );
}

export function PaymentStatusBadge({ status }: { status: AdminPaymentStatus }) {
  const { t } = useI18n();

  return (
    <Badge
      variant="outline"
      className={cn("gap-1.5 rounded-sm font-medium", paymentStatusClasses[status])}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {getPaymentStatusLabel(status, t)}
    </Badge>
  );
}
