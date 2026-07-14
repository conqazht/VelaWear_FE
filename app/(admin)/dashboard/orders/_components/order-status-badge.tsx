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

export function formatStatusLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/^./, (character) => character.toUpperCase());
}

export function OrderStatusBadge({ status }: { status: AdminOrderStatus }) {
  return (
    <Badge variant="outline" className={cn("gap-1.5 rounded-sm font-medium", orderStatusClasses[status])}>
      <span className="size-1.5 rounded-full bg-current" />
      {formatStatusLabel(status)}
    </Badge>
  );
}

export function PaymentStatusBadge({ status }: { status: AdminPaymentStatus }) {
  return (
    <Badge variant="outline" className={cn("gap-1.5 rounded-sm font-medium", paymentStatusClasses[status])}>
      <span className="size-1.5 rounded-full bg-current" />
      {formatStatusLabel(status)}
    </Badge>
  );
}
