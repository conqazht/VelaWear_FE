"use client";

import { useDeferredValue, useState } from "react";
import { Eye } from "lucide-react";

import {
  ResourcePage,
  type ManagementColumn,
  type ManagementFilter,
} from "@/app/(admin)/dashboard/_components/management/resource-page";
import {
  downloadCsv,
  formatAdminDateTime,
  formatCurrency,
  getApiErrorMessage,
} from "@/app/(admin)/dashboard/_components/management/resource-utils";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import {
  ADMIN_ORDER_STATUSES,
  ADMIN_PAYMENT_STATUSES,
  type AdminOrder,
  type AdminOrderFilters,
  type AdminOrderStatus,
  type AdminPaymentStatus,
} from "@/lib/api/admin-orders";
import { useAdminOrdersQuery } from "@/lib/queries/admin-orders";

import { OrderDetailsSheet } from "./order-details-sheet";
import { formatStatusLabel, OrderStatusBadge, PaymentStatusBadge } from "./order-status-badge";

type OrderSelection = Pick<AdminOrder, "id" | "orderCode">;
type OrderStatusFilter = AdminOrderStatus | "ALL";
type PaymentStatusFilter = AdminPaymentStatus | "ALL";

export function OrdersManagement() {
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
      header: "Order",
      cell: (order) => (
        <div className="grid gap-1">
          <Button
            variant="link"
            className="h-auto w-fit p-0 font-medium text-foreground"
            onClick={() => setSelectedOrder({ id: order.id, orderCode: order.orderCode })}
          >
            {order.orderCode}
          </Button>
          <span className="text-muted-foreground text-xs">{formatAdminDateTime(order.createdAt)}</span>
        </div>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      cell: (order) => (
        <div className="grid max-w-52 gap-0.5">
          <span className="truncate font-medium">{order.userFullName || order.receiverName || "—"}</span>
          <span className="truncate text-muted-foreground text-xs">{order.userEmail || "—"}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (order) => <OrderStatusBadge status={order.status} />,
    },
    {
      key: "payment",
      header: "Payment",
      cell: (order) => (
        <div className="grid gap-1">
          <PaymentStatusBadge status={order.paymentStatus} />
          <span className="text-muted-foreground text-xs">{formatStatusLabel(order.paymentMethod || "Unknown")}</span>
        </div>
      ),
    },
    {
      key: "recipient",
      header: "Recipient",
      cell: (order) => (
        <div className="grid max-w-44 gap-0.5">
          <span className="truncate">{order.receiverName || "—"}</span>
          <span className="truncate text-muted-foreground text-xs">{order.receiverPhone || "—"}</span>
        </div>
      ),
    },
    {
      key: "total",
      header: "Total",
      headerClassName: "text-right",
      className: "text-right",
      cell: (order) => <span className="font-medium tabular-nums">{formatCurrency(order.finalAmount)}</span>,
    },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      className: "text-right",
      cell: (order) => (
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`View order ${order.orderCode}`}
          onClick={() => setSelectedOrder({ id: order.id, orderCode: order.orderCode })}
        >
          <Eye />
        </Button>
      ),
    },
  ];

  const filters: ManagementFilter[] = [
    {
      label: "Status",
      value: status,
      options: [
        { label: "All", value: "ALL" },
        ...ADMIN_ORDER_STATUSES.map((value) => ({ label: formatStatusLabel(value), value })),
      ],
      onValueChange: (value) => {
        if (value === "ALL" || ADMIN_ORDER_STATUSES.some((option) => option === value)) {
          setStatus(value as OrderStatusFilter);
          setPage(1);
        }
      },
    },
    {
      label: "Payment",
      value: paymentStatus,
      options: [
        { label: "All", value: "ALL" },
        ...ADMIN_PAYMENT_STATUSES.map((value) => ({ label: formatStatusLabel(value), value })),
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
    !isAuthLoading && !isAuthenticated
      ? "Authentication is required to manage orders. Please sign in with an authorized admin account."
      : null;
  const queryError = ordersQuery.isError ? getApiErrorMessage(ordersQuery.error) : null;

  return (
    <>
      <ResourcePage
        title="Orders"
        description="Review customer orders, payment state, fulfillment progress, and order history."
        rows={rows}
        columns={columns}
        total={meta?.total ?? 0}
        page={page}
        pageSize={pageSize}
        pageCount={meta?.pages ?? 1}
        searchValue={search}
        searchPlaceholder="Search order code..."
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
              status: order.status,
              paymentMethod: order.paymentMethod,
              paymentStatus: order.paymentStatus,
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
        emptyTitle="No orders found"
        emptyDescription="Try a different order code or status filter."
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
