"use client";

import { useDeferredValue, useState } from "react";
import { Eye } from "lucide-react";

import {
  ResourcePage,
  type ManagementColumn,
  type ManagementFilter,
} from "@/app/(admin)/dashboard/_components/management/resource-page";
import { downloadCsv } from "@/app/(admin)/dashboard/_components/management/resource-utils";
import { useAuth } from "@/components/auth/auth-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  ADMIN_ORDER_STATUSES,
  ADMIN_PAYMENT_STATUSES,
  type AdminOrder,
  type AdminOrderFilters,
  type AdminOrderStatus,
  type AdminPaymentStatus,
} from "@/lib/api/admin-orders";
import { formatCurrency, formatDateTime } from "@/lib/i18n/format";
import { useAdminOrdersQuery } from "@/lib/queries/admin-orders";

import { OrderDetailsSheet } from "./order-details-sheet";
import {
  getOrderStatusLabel,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  OrderStatusBadge,
  PaymentStatusBadge,
} from "./order-status-badge";

type OrderSelection = Pick<AdminOrder, "id" | "orderCode">;
type OrderStatusFilter = AdminOrderStatus | "ALL";
type PaymentStatusFilter = AdminPaymentStatus | "ALL";

export function OrdersManagement() {
  const { locale, t } = useI18n();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<OrderStatusFilter>("ALL");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusFilter>("ALL");
  const [selectedOrder, setSelectedOrder] = useState<OrderSelection | null>(null);
  const deferredSearch = useDeferredValue(search.trim());

  const queryFilters: AdminOrderFilters = {
    page,
    size: pageSize,
    sort: "createdAt,desc",
    orderCode: deferredSearch || undefined,
    status: status === "ALL" ? undefined : status,
    paymentStatus: paymentStatus === "ALL" ? undefined : paymentStatus,
  };
  const ordersQuery = useAdminOrdersQuery(queryFilters, isAuthenticated);
  const rows = ordersQuery.data?.result ?? [];
  const meta = ordersQuery.data?.meta;

  const columns: ManagementColumn<AdminOrder>[] = [
    {
      key: "order",
      header: t("admin.commerce.orders.column.order"),
      cell: (order) => (
        <div className="grid gap-1">
          <Button
            variant="link"
            className="text-foreground h-auto w-fit p-0 font-medium"
            onClick={() => setSelectedOrder({ id: order.id, orderCode: order.orderCode })}
          >
            {order.orderCode}
          </Button>
          <span className="text-muted-foreground text-xs">
            {formatDateTime(order.createdAt, locale)}
          </span>
        </div>
      ),
    },
    {
      key: "customer",
      header: t("admin.commerce.orders.column.customer"),
      cell: (order) => (
        <div className="grid max-w-52 gap-0.5">
          <span className="truncate font-medium">
            {order.userFullName || order.receiverName || "—"}
          </span>
          <span className="text-muted-foreground truncate text-xs">{order.userEmail || "—"}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: t("admin.commerce.common.status"),
      cell: (order) => <OrderStatusBadge status={order.status} />,
    },
    {
      key: "payment",
      header: t("admin.commerce.orders.column.payment"),
      cell: (order) => (
        <div className="grid gap-1">
          <PaymentStatusBadge status={order.paymentStatus} />
          <span className="text-muted-foreground text-xs">
            {getPaymentMethodLabel(order.paymentMethod, t)}
          </span>
        </div>
      ),
    },
    {
      key: "recipient",
      header: t("admin.commerce.orders.column.recipient"),
      cell: (order) => (
        <div className="grid max-w-44 gap-0.5">
          <span className="truncate">{order.receiverName || "—"}</span>
          <span className="text-muted-foreground truncate text-xs">
            {order.receiverPhone || "—"}
          </span>
        </div>
      ),
    },
    {
      key: "total",
      header: t("admin.commerce.orders.column.total"),
      headerClassName: "text-right",
      className: "text-right",
      cell: (order) => (
        <span className="font-medium tabular-nums">
          {formatCurrency(order.finalAmount, locale)}
        </span>
      ),
    },
    {
      key: "actions",
      header: <span className="sr-only">{t("admin.commerce.common.actions")}</span>,
      className: "text-right",
      cell: (order) => (
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={t("admin.commerce.orders.view", { code: order.orderCode })}
          onClick={() => setSelectedOrder({ id: order.id, orderCode: order.orderCode })}
        >
          <Eye />
        </Button>
      ),
    },
  ];

  const filters: ManagementFilter[] = [
    {
      label: t("admin.commerce.common.status"),
      value: status,
      options: [
        { label: t("admin.commerce.common.all"), value: "ALL" },
        ...ADMIN_ORDER_STATUSES.map((value) => ({
          label: getOrderStatusLabel(value, t),
          value,
        })),
      ],
      onValueChange: (value) => {
        if (value === "ALL" || ADMIN_ORDER_STATUSES.some((option) => option === value)) {
          setStatus(value as OrderStatusFilter);
          setPage(1);
        }
      },
    },
    {
      label: t("admin.commerce.orders.filter.payment"),
      value: paymentStatus,
      options: [
        { label: t("admin.commerce.common.all"), value: "ALL" },
        ...ADMIN_PAYMENT_STATUSES.map((value) => ({
          label: getPaymentStatusLabel(value, t),
          value,
        })),
      ],
      onValueChange: (value) => {
        if (value === "ALL" || ADMIN_PAYMENT_STATUSES.some((option) => option === value)) {
          setPaymentStatus(value as PaymentStatusFilter);
          setPage(1);
        }
      },
    },
  ];

  const authenticationError =
    !isAuthLoading && !isAuthenticated ? t("admin.commerce.orders.authenticationRequired") : null;
  const queryError = ordersQuery.isError ? ordersQuery.error : null;

  return (
    <>
      <ResourcePage
        title={t("admin.commerce.orders.title")}
        description={t("admin.commerce.orders.description")}
        rows={rows}
        columns={columns}
        total={meta?.total ?? 0}
        page={page}
        pageSize={pageSize}
        pageCount={meta?.pages ?? 1}
        searchValue={search}
        searchPlaceholder={t("admin.commerce.orders.search")}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        filters={filters}
        onRefresh={() => void ordersQuery.refetch()}
        onExport={() => {
          downloadCsv(
            "vela-orders.csv",
            rows.map((order) => ({
              orderCode: order.orderCode,
              customer: order.userFullName,
              email: order.userEmail,
              status: getOrderStatusLabel(order.status, t),
              paymentMethod: getPaymentMethodLabel(order.paymentMethod, t),
              paymentStatus: getPaymentStatusLabel(order.paymentStatus, t),
              finalAmount: order.finalAmount,
              receiverName: order.receiverName,
              receiverPhone: order.receiverPhone,
              createdAt: order.createdAt,
            })),
          );
        }}
        isLoading={isAuthLoading || (isAuthenticated && ordersQuery.isLoading)}
        isFetching={ordersQuery.isFetching}
        error={authenticationError ?? queryError}
        emptyTitle={t("admin.commerce.orders.emptyTitle")}
        emptyDescription={t("admin.commerce.orders.emptyDescription")}
      />

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
}
