"use client";

import * as React from "react";
import { Skeleton as BoneyardSkeleton } from "boneyard-js/react";
import type { LucideIcon } from "lucide-react";
import { Download, Plus, RefreshCw, Search } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type ManagementColumn<T> = {
  key: string;
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
};

export type ManagementFilter = {
  label: string;
  value: string;
  options: Array<{ label: string; value: string }>;
  onValueChange: (value: string | null) => void;
};

type ResourcePageProps<T extends { id: number }> = {
  title: string;
  description: string;
  rows: T[];
  columns: ManagementColumn<T>[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  searchValue: string;
  searchPlaceholder: string;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  filters?: ManagementFilter[];
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
    disabled?: boolean;
  };
  onExport?: () => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  isFetching?: boolean;
  error?: string | null;
  emptyTitle?: string;
  emptyDescription?: string;
};

export function ResourcePage<T extends { id: number }>({
  title,
  description,
  rows,
  columns,
  total,
  page,
  pageSize,
  pageCount,
  searchValue,
  searchPlaceholder,
  onSearchChange,
  onPageChange,
  onPageSizeChange,
  filters = [],
  primaryAction,
  onExport,
  onRefresh,
  isLoading = false,
  isFetching = false,
  error,
  emptyTitle = "No results found",
  emptyDescription = "Try adjusting your search or filters.",
}: ResourcePageProps<T>) {
  const ActionIcon = primaryAction?.icon ?? Plus;
  const safePageCount = Math.max(pageCount, 1);
  const currentPage = Math.min(Math.max(page, 1), safePageCount);
  const start = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = total === 0 ? 0 : Math.min(currentPage * pageSize, total);

  const content = (
    <Card>
      <CardHeader className="border-b has-data-[slot=card-action]:grid-cols-1 md:has-data-[slot=card-action]:grid-cols-[1fr_auto]">
        <CardTitle className="text-xl leading-none">{title}</CardTitle>
        <CardDescription className="max-w-xl leading-snug">{description}</CardDescription>
        <CardAction className="col-start-1 row-start-auto flex w-full flex-wrap justify-start gap-2 justify-self-stretch md:col-start-2 md:row-span-2 md:row-start-1 md:w-auto md:flex-nowrap md:justify-end md:justify-self-end">
          <InputGroup className="h-8 w-full md:w-64">
            <InputGroupAddon align="inline-start">
              <Search className="size-3.5" />
            </InputGroupAddon>
            <InputGroupInput
              aria-label={`Search ${title.toLowerCase()}`}
              className="h-8"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </InputGroup>
          {onRefresh ? (
            <Button variant="outline" size="sm" onClick={onRefresh} disabled={isFetching}>
              <RefreshCw className={cn(isFetching && "animate-spin")} />
              Refresh
            </Button>
          ) : null}
          {onExport ? (
            <Button variant="outline" size="sm" onClick={onExport} disabled={rows.length === 0}>
              <Download /> Export page
            </Button>
          ) : null}
          {primaryAction ? (
            <Button size="sm" onClick={primaryAction.onClick} disabled={primaryAction.disabled}>
              <ActionIcon /> {primaryAction.label}
            </Button>
          ) : null}
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 px-0">
        {filters.length > 0 ? (
          <div className="flex flex-wrap items-center gap-3 px-4">
            {filters.map((filter) => (
              <Select key={filter.label} value={filter.value} onValueChange={filter.onValueChange}>
                <SelectTrigger size="sm">
                  <span className="text-muted-foreground">{filter.label}:</span>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="start" alignItemWithTrigger={false}>
                  {filter.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
          </div>
        ) : null}

        {error ? (
          <div className="px-4">
            <Alert variant="destructive">
              <AlertTitle>Unable to load {title.toLowerCase()}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        ) : null}

        <div className="overflow-x-auto">
          <Table className="min-w-[860px] **:data-[slot='table-cell']:px-4 **:data-[slot='table-head']:px-4">
            <TableHeader className="[&_tr]:border-t">
              <TableRow className="hover:bg-transparent">
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    className={cn("h-11 whitespace-nowrap font-normal", column.headerClassName)}
                  >
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: Math.min(pageSize, 8) }, (_, index) => (
                  <TableRow key={`loading-${index}`}>
                    {columns.map((column) => (
                      <TableCell key={column.key} className="h-16">
                        <Skeleton className="h-4 w-full max-w-40" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : rows.length > 0 ? (
                rows.map((row) => (
                  <TableRow key={row.id} className="border-border/60 hover:bg-muted/30">
                    {columns.map((column) => (
                      <TableCell key={column.key} className={cn("py-3 align-middle", column.className)}>
                        {column.cell(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-40 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center gap-1">
                      <p className="font-medium">{emptyTitle}</p>
                      <p className="text-muted-foreground text-sm">{emptyDescription}</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <Separator />

        <div className="flex flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-muted-foreground text-sm tabular-nums">
            Showing {start} to {end} of {total}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground text-sm">Rows per page</span>
            <Select value={`${pageSize}`} onValueChange={(value) => onPageSizeChange(Number(value))}>
              <SelectTrigger size="sm" className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 50].map((size) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="min-w-24 text-center text-muted-foreground text-sm tabular-nums">
              Page {currentPage} of {safePageCount}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1 || isFetching}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= safePageCount || isFetching}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <BoneyardSkeleton
      name="management-resource-page"
      loading={isLoading}
      fixture={content}
    >
      {content}
    </BoneyardSkeleton>
  );
}
