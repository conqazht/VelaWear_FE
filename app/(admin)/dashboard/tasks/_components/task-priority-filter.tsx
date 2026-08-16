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

import { priorities } from "./data";

interface TaskPriorityFilterProps<TData> {
  table: Table<TData>;
}

export function TaskPriorityFilter<TData>({ table }: TaskPriorityFilterProps<TData>) {
  const { t } = useI18n();
  const priorityNames: Record<string, string> = {
    high: t("admin.workflows.common.high"),
    low: t("admin.workflows.common.low"),
    medium: t("admin.workflows.common.medium"),
  };
  const column = table.getColumn("priority");

  if (!column) {
    return null;
  }

  const priorityColumn = column;
  const selectedValues = new Set(priorityColumn.getFilterValue() as string[]);

  function updateFilter(value: string) {
    if (selectedValues.has(value)) {
      selectedValues.delete(value);
    } else {
      selectedValues.add(value);
    }

    const filterValues = Array.from(selectedValues);
    priorityColumn.setFilterValue(filterValues.length ? filterValues : undefined);
    table.setPageIndex(0);
  }

  function clearFilter() {
    priorityColumn.setFilterValue(undefined);
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
        {t("admin.workflows.common.priority")}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-50">
        <DropdownMenuGroup>
          {priorities.map((priority) => {
            const isSelected = selectedValues.has(priority.value);

            return (
              <DropdownMenuCheckboxItem
                key={priority.value}
                checked={isSelected}
                onCheckedChange={() => updateFilter(priority.value)}
                onSelect={(event) => event.preventDefault()}
              >
                <priority.icon className="text-muted-foreground" />
                {priorityNames[priority.value] ?? priority.label}
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
