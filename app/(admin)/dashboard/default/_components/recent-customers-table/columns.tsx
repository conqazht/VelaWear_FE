"use client";
"use no memo";

import type { ColumnDef } from "@tanstack/react-table";
import { addMinutes, differenceInCalendarDays, endOfToday, parseISO } from "date-fns";
import { CircleAlertIcon, CircleCheckIcon, Clock3Icon, LoaderIcon, UserRound } from "lucide-react";

import { useI18n } from "@/components/providers/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { getIntlLocale } from "@/lib/i18n";

import type { RecentCustomerRow } from "./schema";

function billingIcon(billing: string) {
  switch (billing) {
    case "Paid":
      return (
        <CircleCheckIcon className="stroke-primary-foreground fill-green-500 dark:fill-green-600" />
      );
    case "Pending":
      return <LoaderIcon />;
    case "Overdue":
      return <CircleAlertIcon className="text-amber-600 dark:text-amber-500" />;
    case "Trial":
      return <Clock3Icon className="text-muted-foreground" />;
    default:
      return null;
  }
}

export function useRecentCustomersColumns(): ColumnDef<RecentCustomerRow>[] {
  const { locale, t } = useI18n();
  const intlLocale = getIntlLocale(locale);
  const dateFormatter = new Intl.DateTimeFormat(intlLocale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeFormatter = new Intl.DateTimeFormat(intlLocale, { hour: "numeric", minute: "2-digit" });
  const statusLabels: Record<string, string> = {
    Inactive: t("admin.dashboardsA.common.inactive"),
    Subscribed: t("admin.dashboardsA.common.subscribed"),
    Unsubscribed: t("admin.dashboardsA.common.unsubscribed"),
  };
  const billingLabels: Record<string, string> = {
    Overdue: t("admin.dashboardsA.common.overdue"),
    Paid: t("admin.dashboardsA.common.paid"),
    Pending: t("admin.dashboardsA.common.pending"),
    Trial: t("admin.dashboardsA.common.trial"),
  };
  const planLabels: Record<string, string> = {
    Enterprise: t("admin.dashboardsA.common.planEnterprise"),
    Growth: t("admin.dashboardsA.common.planGrowth"),
    Pro: t("admin.dashboardsA.common.planPro"),
    Starter: t("admin.dashboardsA.common.planStarter"),
  };

  return [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={table.getIsAllPageRowsSelected() ? true : table.getIsSomePageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label={t("admin.dashboardsA.default.selectAllCustomers")}
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label={t("admin.dashboardsA.default.selectCustomer", { name: row.original.name })}
          />
        </div>
      ),
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: t("admin.dashboardsA.default.customer"),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="bg-muted flex size-8 items-center justify-center rounded-md border">
            <UserRound className="text-muted-foreground size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-end justify-between gap-3">
              <div className="grid min-w-0 gap-0.5">
                <span className="truncate text-sm leading-none font-medium">
                  {row.original.name}
                </span>
                <span className="text-muted-foreground truncate text-xs leading-none">
                  #{row.original.id}
                </span>
              </div>
            </div>
          </div>
        </div>
      ),
      enableHiding: false,
    },
    {
      id: "search",
      accessorFn: (row) => `${row.id} ${row.name} ${row.email}`,
      filterFn: "includesString",
      enableHiding: true,
    },
    {
      accessorKey: "status",
      header: t("admin.dashboardsA.common.status"),
      filterFn: "equalsString",
      cell: ({ row }) => (
        <Badge variant="outline" className="text-muted-foreground px-1.5">
          {statusLabels[row.original.status] ?? row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "billing",
      header: t("admin.dashboardsA.common.billing"),
      filterFn: "equalsString",
      cell: ({ row }) => (
        <Badge variant="outline" className="text-muted-foreground px-1.5">
          {billingIcon(row.original.billing)}
          {billingLabels[row.original.billing] ?? row.original.billing}
        </Badge>
      ),
    },
    {
      accessorKey: "plan",
      header: t("admin.dashboardsA.default.plan"),
      cell: ({ row }) => (
        <span className="text-sm">{planLabels[row.original.plan] ?? row.original.plan}</span>
      ),
    },
    {
      id: "joinedWindow",
      accessorFn: (row) => {
        const daysSinceJoined = differenceInCalendarDays(endOfToday(), parseISO(row.joined));

        if (daysSinceJoined <= 30) return ["30", "90"];
        if (daysSinceJoined <= 90) return ["90"];
        return [];
      },
      filterFn: "arrIncludes",
      enableHiding: true,
    },
    {
      accessorKey: "joined",
      header: t("admin.dashboardsA.default.joined"),
      cell: ({ row }) => {
        const baseDate = parseISO(row.original.joined);
        const joinedAt = addMinutes(baseDate, 9 * 60 + (Number(row.original.id) % 12) * 17);

        return (
          <div className="grid gap-0.5">
            <span className="text-sm">{dateFormatter.format(joinedAt)}</span>
            <span className="text-muted-foreground text-xs">
              {t("admin.dashboardsA.default.joinedAt", { time: timeFormatter.format(joinedAt) })}
            </span>
          </div>
        );
      },
    },
  ];
}
