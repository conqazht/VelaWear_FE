import type { ColumnDef } from "@tanstack/react-table";
import { Copy, Eye, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency, formatDateTime } from "@/lib/i18n/format";
import type { AdminOrderStatus, AdminPaymentStatus } from "@/lib/api/admin-orders";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/app/(admin)/dashboard/orders/_components/order-status-badge";

import type { OrderRow } from "./schema";

export function useRecentOrdersColumns({
  onSelectOrder,
}: {
  onSelectOrder?: (order: OrderRow) => void;
} = {}): ColumnDef<OrderRow>[] {
  const { locale, t } = useI18n();

  return [
    {
      id: "select",
      header: ({ table }) => (
        <div className="w-10">
          <Checkbox
            aria-label={t("admin.dashboardsA.ecommerce.selectAllOrders")}
            checked={table.getIsAllPageRowsSelected() ? true : table.getIsSomePageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="w-10">
          <Checkbox
            aria-label={t("admin.dashboardsA.ecommerce.selectOrder", { id: row.original.orderCode })}
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
          />
        </div>
      ),
      enableHiding: false,
      enableSorting: false,
    },
    {
      accessorKey: "orderCode",
      header: t("admin.dashboardsA.ecommerce.order"),
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <button
            type="button"
            className="text-left font-medium text-foreground hover:underline cursor-pointer"
            onClick={() => onSelectOrder?.(row.original)}
          >
            #{row.original.orderCode}
          </button>
          <div className="text-muted-foreground text-xs">{row.original.paymentMethod || "COD"}</div>
        </div>
      ),
      enableHiding: false,
    },
    {
      accessorKey: "customerName",
      header: t("admin.dashboardsA.ecommerce.customer"),
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5 max-w-[200px]">
          <span className="font-medium text-foreground truncate">{row.original.customerName}</span>
          <span className="text-muted-foreground text-xs truncate">{row.original.customerEmail}</span>
        </div>
      ),
    },
    {
      id: "statusSummary",
      accessorKey: "status",
      header: t("admin.dashboardsA.common.status"),
      cell: ({ row }) => (
        <div className="flex flex-wrap items-center gap-1.5">
          <OrderStatusBadge status={row.original.status as AdminOrderStatus} />
          <PaymentStatusBadge status={row.original.paymentStatus as AdminPaymentStatus} />
        </div>
      ),
      filterFn: (row, _columnId, value) => {
        if (!value || value === "ALL") return true;
        if (value === "PENDING") return row.original.status === "PENDING";
        if (value === "SHIPPING") {
          return row.original.status === "SHIPPING" || row.original.status === "CONFIRMED";
        }
        if (value === "COMPLETED") return row.original.status === "COMPLETED";
        if (value === "CANCELLED") {
          return row.original.status === "CANCELLED" || row.original.status === "REFUNDED";
        }
        return true;
      },
    },
    {
      accessorKey: "totalAmount",
      header: () => <div className="w-28 text-right">{t("admin.dashboardsA.ecommerce.total")}</div>,
      cell: ({ row }) => (
        <div className="w-28 text-right font-medium tabular-nums">
          {formatCurrency(row.original.totalAmount, locale)}
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: () => <div className="w-40">{t("admin.dashboardsA.ecommerce.date")}</div>,
      cell: ({ row }) => (
        <div className="text-muted-foreground w-40 text-xs tabular-nums">
          {formatDateTime(row.original.createdAt, locale)}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => (
        <div className="flex w-full justify-end">{t("admin.dashboardsA.ecommerce.actions")}</div>
      ),
      cell: ({ row }) => (
        <div className="flex w-full justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  aria-label={t("admin.dashboardsA.ecommerce.openOrderActions")}
                  size="icon-sm"
                  variant="ghost"
                />
              }
            >
              <MoreHorizontal />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel>{t("admin.dashboardsA.ecommerce.orderActions")}</DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => onSelectOrder?.(row.original)}>
                  <Eye className="size-4 mr-2" />
                  {t("admin.dashboardsA.ecommerce.viewOrder")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    void navigator.clipboard.writeText(row.original.orderCode);
                    toast.success(
                      locale === "vi"
                        ? `Đã sao chép mã đơn #${row.original.orderCode}`
                        : `Copied order #${row.original.orderCode}`,
                    );
                  }}
                >
                  <Copy className="size-4 mr-2" />
                  {t("admin.dashboardsA.ecommerce.copyOrderId")}
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      enableHiding: false,
      enableSorting: false,
    },
  ];
}
