import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

import { useI18n } from "@/components/providers/i18n-provider";
import { Badge } from "@/components/ui/badge";
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
import { getIntlLocale } from "@/lib/i18n";

import type { OrderRow } from "./schema";

function PaymentBadge({ label, status }: { label: string; status: OrderRow["payment"] }) {
  if (status === "Paid") {
    return (
      <Badge
        className="border-green-700/25 text-green-700 dark:border-green-300/25 dark:text-green-300"
        variant="outline"
      >
        <span className="size-1.5 rounded-full bg-current" />
        {label}
      </Badge>
    );
  }

  if (status === "Refunded") {
    return (
      <Badge variant="destructive">
        <span className="size-1.5 rounded-full bg-current" />
        {label}
      </Badge>
    );
  }

  return (
    <Badge
      className="border-yellow-700/25 text-yellow-700 dark:border-yellow-300/25 dark:text-yellow-300"
      variant="outline"
    >
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </Badge>
  );
}

function FulfillmentBadge({ label, status }: { label: string; status: OrderRow["fulfillment"] }) {
  if (status === "Fulfilled") {
    return (
      <Badge
        className="border-green-700/25 text-green-700 dark:border-green-300/25 dark:text-green-300"
        variant="outline"
      >
        <span className="size-1.5 rounded-full bg-current" />
        {label}
      </Badge>
    );
  }

  if (status === "Returned") {
    return (
      <Badge variant="destructive">
        <span className="size-1.5 rounded-full bg-current" />
        {label}
      </Badge>
    );
  }

  return (
    <Badge variant="destructive">
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </Badge>
  );
}

export function useRecentOrdersColumns(): ColumnDef<OrderRow>[] {
  const { locale, t } = useI18n();
  const intlLocale = getIntlLocale(locale);
  const numberFormatter = new Intl.NumberFormat(intlLocale);
  const currencyFormatter = new Intl.NumberFormat(intlLocale, { currency: "USD", style: "currency" });
  const dateFormatter = new Intl.DateTimeFormat(intlLocale, {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  });
  const paymentLabels = {
    Paid: t("admin.dashboardsA.common.paid"),
    Pending: t("admin.dashboardsA.common.pending"),
    Refunded: t("admin.dashboardsA.common.refunded"),
  };
  const fulfillmentLabels = {
    Fulfilled: t("admin.dashboardsA.common.fulfilled"),
    Returned: t("admin.dashboardsA.common.returned"),
    Unfulfilled: t("admin.dashboardsA.common.unfulfilled"),
  };

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
          aria-label={t("admin.dashboardsA.ecommerce.selectOrder", { id: row.original.id })}
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      </div>
    ),
    enableHiding: false,
    enableSorting: false,
  },
  {
    accessorKey: "id",
    header: t("admin.dashboardsA.ecommerce.order"),
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5">
        <div className="font-medium leading-none">{row.original.id}</div>
        <div className="text-muted-foreground text-xs">
          {(() => {
            const count = Number.parseInt(row.original.items, 10);
            const key = count === 1 ? "admin.dashboardsA.ecommerce.item" : "admin.dashboardsA.ecommerce.items";
            return t(key, { count: numberFormatter.format(count) });
          })()}
        </div>
      </div>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "customer",
    header: t("admin.dashboardsA.ecommerce.customer"),
  },
  {
    id: "statusSummary",
    header: t("admin.dashboardsA.common.status"),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <PaymentBadge label={paymentLabels[row.original.payment]} status={row.original.payment} />
        <FulfillmentBadge label={fulfillmentLabels[row.original.fulfillment]} status={row.original.fulfillment} />
      </div>
    ),
    filterFn: (row, _columnId, value) => {
      if (value === "Needs action") {
        return (
          row.original.payment === "Pending" ||
          row.original.payment === "Refunded" ||
          row.original.fulfillment === "Unfulfilled" ||
          row.original.fulfillment === "Returned"
        );
      }

      if (value === "Unfulfilled") {
        return row.original.fulfillment === "Unfulfilled";
      }

      if (value === "Unpaid") {
        return row.original.payment === "Pending";
      }

      if (value === "Returns") {
        return row.original.payment === "Refunded" || row.original.fulfillment === "Returned";
      }

      return true;
    },
  },
  {
    accessorKey: "total",
    header: () => <div className="w-28">{t("admin.dashboardsA.ecommerce.total")}</div>,
    cell: ({ row }) => (
      <div className="w-28 tabular-nums">
        {currencyFormatter.format(Number(row.original.total.replace(/[^0-9.-]/g, "")))}
      </div>
    ),
  },
  {
    accessorKey: "date",
    header: () => <div className="w-44">{t("admin.dashboardsA.ecommerce.date")}</div>,
    cell: ({ row }) => (
      <div className="w-44 text-muted-foreground">{dateFormatter.format(new Date(row.original.date))}</div>
    ),
  },
  {
    id: "actions",
    header: () => <div className="flex w-full justify-end">{t("admin.dashboardsA.ecommerce.actions")}</div>,
    cell: () => (
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
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuLabel>{t("admin.dashboardsA.ecommerce.orderActions")}</DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem>{t("admin.dashboardsA.ecommerce.viewOrder")}</DropdownMenuItem>
              <DropdownMenuItem>{t("admin.dashboardsA.ecommerce.contactCustomer")}</DropdownMenuItem>
              <DropdownMenuItem>{t("admin.dashboardsA.ecommerce.copyOrderId")}</DropdownMenuItem>
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
