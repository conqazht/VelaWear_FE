"use client";
"use no memo";

import * as React from "react";
import Link from "next/link";
import {
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ArrowUpRight, Download } from "lucide-react";

import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { downloadCsv } from "@/app/(admin)/dashboard/_components/management/resource-utils";
import { OrderDetailsSheet } from "@/app/(admin)/dashboard/orders/_components/order-details-sheet";
import type { RecentOrderSummary } from "@/lib/api/admin-dashboard";
import { formatNumber } from "@/lib/i18n/format";

import { useRecentOrdersColumns } from "./recent-orders-table/columns";
import { preventPaginationNavigation } from "./recent-orders-table/formatters";
import { type OrderFilter, type OrderRow, orderFilters } from "./recent-orders-table/schema";

type RecentOrdersProps = {
  recentOrders?: RecentOrderSummary[];
};

export function RecentOrders({ recentOrders = [] }: RecentOrdersProps) {
  const { locale, t } = useI18n();
  const [selectedOrder, setSelectedOrder] = React.useState<RecentOrderSummary | null>(null);

  const columns = useRecentOrdersColumns({
    onSelectOrder: (order) => setSelectedOrder(order),
  });

  const filterLabels: Record<OrderFilter, string> = {
    ALL: locale === "vi" ? "Tất cả" : "All",
    PENDING: locale === "vi" ? "Chờ xử lý" : "Pending",
    SHIPPING: locale === "vi" ? "Đang giao" : "Shipping",
    COMPLETED: locale === "vi" ? "Hoàn thành" : "Completed",
    CANCELLED: locale === "vi" ? "Đã hủy" : "Cancelled",
  };

  const [rowSelection, setRowSelection] = React.useState({});
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    data: recentOrders as OrderRow[],
    columns,
    state: {
      rowSelection,
      sorting,
      columnFilters,
      pagination,
    },
    getRowId: (row) => String(row.id),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const activeFilter =
    (table.getColumn("statusSummary")?.getFilterValue() as OrderFilter | undefined) ?? "ALL";
  const orderCount = table.getFilteredRowModel().rows.length;
  const selectedOrderCount = table.getSelectedRowModel().rows.length;
  const visibleOrderCount = table.getRowModel().rows.length;
  const currentPage = table.getState().pagination.pageIndex + 1;
  const pageCount = table.getPageCount();
  const formattedOrderCount = formatNumber(orderCount, locale);
  const orderCountDescription = selectedOrderCount
    ? t("admin.dashboardsA.ecommerce.selectedOrderCount", {
        count: formatNumber(selectedOrderCount, locale),
      })
    : activeFilter === "ALL"
      ? t("admin.dashboardsA.ecommerce.orderCount", { count: formattedOrderCount })
      : `${formattedOrderCount} ${filterLabels[activeFilter].toLowerCase()}`;

  const pageNumbers = React.useMemo(() => {
    if (pageCount <= 3) {
      return Array.from({ length: pageCount }, (_, index) => index + 1);
    }

    if (currentPage <= 2) return [1, 2, 3];
    if (currentPage >= pageCount - 1) return [pageCount - 2, pageCount - 1, pageCount];

    return [currentPage - 1, currentPage, currentPage + 1];
  }, [currentPage, pageCount]);

  const handleDownloadCsv = () => {
    if (recentOrders.length === 0) return;
    const exportData = recentOrders.map((o) => ({
      [locale === "vi" ? "Mã đơn hàng" : "Order Code"]: o.orderCode,
      [locale === "vi" ? "Khách hàng" : "Customer"]: o.customerName,
      [locale === "vi" ? "Email" : "Email"]: o.customerEmail,
      [locale === "vi" ? "Tổng tiền" : "Total Amount"]: o.totalAmount,
      [locale === "vi" ? "Trạng thái" : "Status"]: o.status,
      [locale === "vi" ? "Thanh toán" : "Payment Status"]: o.paymentStatus,
      [locale === "vi" ? "Phương thức" : "Payment Method"]: o.paymentMethod,
      [locale === "vi" ? "Ngày tạo" : "Created At"]: o.createdAt,
    }));
    downloadCsv(`recent-orders-${new Date().toISOString().slice(0, 10)}.csv`, exportData);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-muted-foreground text-sm font-normal">
            {t("admin.dashboardsA.ecommerce.recentOrders")}
          </CardTitle>
          <CardDescription className="text-foreground text-xl leading-none tracking-tight tabular-nums">
            {orderCountDescription}
          </CardDescription>
          <CardAction className="flex items-center gap-1">
            <Button
              aria-label={t("admin.dashboardsA.ecommerce.openOrders")}
              size="icon-sm"
              variant="outline"
              render={
                <Link
                  href="/dashboard/orders"
                  title={locale === "vi" ? "Quản lý đơn hàng" : "View orders"}
                >
                  <ArrowUpRight className="size-4" />
                </Link>
              }
            />
            <Button
              aria-label={t("admin.dashboardsA.ecommerce.downloadOrders")}
              size="icon-sm"
              variant="outline"
              onClick={handleDownloadCsv}
              disabled={recentOrders.length === 0}
            >
              <Download className="size-4" />
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 px-0">
          <div className="flex items-center justify-between px-4">
            <ToggleGroup
              className="bg-muted text-muted-foreground **:data-[slot=toggle-group-item]:text-foreground/60 **:data-[slot=toggle-group-item]:hover:text-foreground [&_[data-slot=toggle-group-item][data-pressed]]:bg-background [&_[data-slot=toggle-group-item][data-pressed]]:text-foreground dark:[&_[data-slot=toggle-group-item][data-pressed]]:border-input dark:[&_[data-slot=toggle-group-item][data-pressed]]:bg-input/30 p-0.75 **:data-[slot=toggle-group-item]:rounded-md **:data-[slot=toggle-group-item]:border **:data-[slot=toggle-group-item]:border-transparent [&_[data-slot=toggle-group-item][data-pressed]]:shadow-sm"
              onValueChange={(value) => {
                const filter = value[0] as OrderFilter | undefined;
                if (!filter) return;
                table
                  .getColumn("statusSummary")
                  ?.setFilterValue(filter === "ALL" ? undefined : filter);
                table.setPageIndex(0);
              }}
              size="sm"
              spacing={1}
              value={[activeFilter]}
            >
              {orderFilters.map((filter) => (
                <ToggleGroupItem key={filter} value={filter}>
                  {filterLabels[filter]}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>

            <Button
              aria-label={t("admin.dashboardsA.ecommerce.sortOrders")}
              size="icon-sm"
              variant="outline"
              onClick={() =>
                table
                  .getColumn("createdAt")
                  ?.toggleSorting(table.getColumn("createdAt")?.getIsSorted() === "asc")
              }
            >
              <ArrowUpDown className="size-4" />
            </Button>
          </div>

          <div className="overflow-hidden">
            <Table className="**:data-[slot='table-cell']:px-4.5 **:data-[slot='table-head']:px-4.5">
              <TableHeader className="**:data-[slot='table-head']:text-foreground border-t **:data-[slot='table-head']:h-11 **:data-[slot='table-head']:text-sm **:data-[slot='table-head']:font-normal">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot='table-row']:border-border/50 **:data-[slot='table-cell']:px-4 **:data-[slot='table-cell']:py-3 **:data-[slot='table-row']:hover:bg-transparent">
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      className="h-24 text-center text-muted-foreground"
                      colSpan={table.getVisibleLeafColumns().length}
                    >
                      {t("admin.dashboardsA.ecommerce.noOrders")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between gap-4 px-4 pb-1">
            <p className="text-muted-foreground text-sm">
              {t("admin.dashboardsA.ecommerce.viewingOrders", {
                total: formattedOrderCount,
                visible: formatNumber(visibleOrderCount, locale),
              })}
            </p>

            <Pagination className="mx-0 w-auto justify-end">
              <PaginationContent className="gap-1.5">
                <PaginationItem>
                  <PaginationPrevious
                    className={
                      !table.getCanPreviousPage() ? "pointer-events-none opacity-50" : undefined
                    }
                    href="#"
                    onClick={(event) => {
                      preventPaginationNavigation(event);
                      table.previousPage();
                    }}
                  />
                </PaginationItem>
                {pageNumbers[0] > 1 ? (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : null}
                {pageNumbers.map((pageNumber) => (
                  <PaginationItem key={`page-${pageNumber}`}>
                    <PaginationLink
                      href="#"
                      isActive={table.getState().pagination.pageIndex === pageNumber - 1}
                      onClick={(event) => {
                        preventPaginationNavigation(event);
                        table.setPageIndex(pageNumber - 1);
                      }}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                {pageNumbers[pageNumbers.length - 1] < pageCount ? (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : null}
                <PaginationItem>
                  <PaginationNext
                    className={!table.getCanNextPage() ? "pointer-events-none opacity-50" : undefined}
                    href="#"
                    onClick={(event) => {
                      preventPaginationNavigation(event);
                      table.nextPage();
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>

      <OrderDetailsSheet
        orderId={selectedOrder?.id}
        orderCode={selectedOrder?.orderCode}
        open={selectedOrder !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedOrder(null);
          }
        }}
      />
    </>
  );
}
