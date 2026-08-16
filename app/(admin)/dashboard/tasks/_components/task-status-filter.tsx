"use client";
"use no memo";

import type { Table } from "@tanstack/react-table";
import { ListFilter, X } from "lucide-react";

import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import { statuses } from "./data";

interface TaskStatusFilterProps<TData> {
  table: Table<TData>;
}

export function TaskStatusFilter<TData>({ table }: TaskStatusFilterProps<TData>) {
  const { t } = useI18n();
  const statusNames: Record<string, string> = {
    backlog: t("admin.workflows.tasks.statusBacklog"),
    canceled: t("admin.workflows.tasks.statusCanceled"),
    done: t("admin.workflows.tasks.statusDone"),
    "in progress": t("admin.workflows.tasks.statusInProgress"),
    todo: t("admin.workflows.tasks.statusTodo"),
  };
  const column = table.getColumn("status");

  if (!column) {
    return null;
  }

  const statusColumn = column;
  const selectedValues = new Set(statusColumn.getFilterValue() as string[]);

  function updateFilter(value: string) {
    if (selectedValues.has(value)) {
      selectedValues.delete(value);
    } else {
      selectedValues.add(value);
    }

    const filterValues = Array.from(selectedValues);
    statusColumn.setFilterValue(filterValues.length ? filterValues : undefined);
    table.setPageIndex(0);
  }

  function clearFilter() {
    statusColumn.setFilterValue(undefined);
    table.setPageIndex(0);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            className={cn(
              "border-dashed",
              selectedValues.size > 0 && "bg-muted text-foreground border-solid",
            )}
          />
        }
      >
        <ListFilter data-icon="inline-start" />
        {t("admin.workflows.common.status")}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-50">
        <DropdownMenuGroup>
          {statuses.map((status) => {
            const isSelected = selectedValues.has(status.value);

            return (
              <DropdownMenuCheckboxItem
                key={status.value}
                checked={isSelected}
                onCheckedChange={() => updateFilter(status.value)}
                onSelect={(event) => event.preventDefault()}
              >
                <status.icon className="text-muted-foreground" />
                {statusNames[status.value] ?? status.label}
              </DropdownMenuCheckboxItem>
            );
          })}
        </DropdownMenuGroup>
        {selectedValues.size > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onSelect={clearFilter} className="justify-center text-center">
                <X />
                {t("admin.workflows.common.clearFilters")}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
