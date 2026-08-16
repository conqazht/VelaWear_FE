"use client";
"use no memo";

import type { Table } from "@tanstack/react-table";
import { Settings2, X } from "lucide-react";

import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { TaskPriorityFilter } from "./task-priority-filter";
import { TaskStatusFilter } from "./task-status-filter";

interface TasksToolbarProps<TData> {
  table: Table<TData>;
}

export function TasksToolbar<TData>({ table }: TasksToolbarProps<TData>) {
  const { t } = useI18n();
  const columnLabels: Record<string, string> = {
    priority: t("admin.workflows.common.priority"),
    status: t("admin.workflows.common.status"),
    title: t("admin.workflows.tasks.title"),
  };
  const isFiltered = table.getState().columnFilters.length > 0;
  const searchValue = (table.getColumn("title")?.getFilterValue() as string | undefined) ?? "";
  const hideableColumns = table
    .getAllColumns()
    .filter((column) => typeof column.accessorFn !== "undefined" && column.getCanHide());
  const hiddenColumns = hideableColumns.filter((column) => !column.getIsVisible());

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <Input
          placeholder={t("admin.workflows.tasks.filterPlaceholder")}
          value={searchValue}
          onChange={(event) => {
            table.getColumn("title")?.setFilterValue(event.target.value);
            table.setPageIndex(0);
          }}
          className="bg-background text-foreground placeholder:text-muted-foreground w-full sm:w-64"
        />
        <TaskStatusFilter table={table} />
        <TaskPriorityFilter table={table} />
        {isFiltered && (
          <Button
            variant="destructive"
            onClick={() => {
              table.resetColumnFilters();
              table.setPageIndex(0);
            }}
          >
            <X data-icon="inline-start" />
            {t("admin.workflows.common.reset")}
          </Button>
        )}
      </div>
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "ml-auto hidden lg:flex",
                  hiddenColumns.length > 0 && "bg-muted text-foreground",
                )}
              />
            }
          >
            <Settings2 data-icon="inline-start" />
            {t("admin.workflows.tasks.view")}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-38">
            <DropdownMenuLabel>{t("admin.workflows.tasks.toggleColumns")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {hideableColumns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {columnLabels[column.id] ?? column.id}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
