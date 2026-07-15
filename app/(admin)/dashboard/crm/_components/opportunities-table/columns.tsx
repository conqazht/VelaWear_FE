"use client";
"use no memo";

import type { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";

import { useI18n } from "@/components/providers/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { getIntlLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import type { OpportunityRow } from "./schema";

const healthStripSlots = Array.from({ length: 18 }, (_, index) => ({
  id: `strip-${index + 1}`,
  threshold: index + 1,
}));

function getHealthScore(health: OpportunityRow["health"]) {
  switch (health) {
    case "On Track":
      return 18;
    case "Needs Review":
      return 11;
    case "At Risk":
      return 7;
    case "On Hold":
      return 4;
    default:
      return 0;
  }
}

export function useOpportunitiesColumns(): ColumnDef<OpportunityRow>[] {
  const { locale, t } = useI18n();
  const intlLocale = getIntlLocale(locale);
  const numberFormatter = new Intl.NumberFormat(intlLocale);
  const currencyFormatter = new Intl.NumberFormat(intlLocale, {
    currency: "USD",
    maximumFractionDigits: 0,
    style: "currency",
  });
  const stageLabels: Record<string, string> = {
    Discovery: t("admin.dashboardsA.crm.discovery"),
    Negotiation: t("admin.dashboardsA.crm.negotiation"),
    "Proposal Sent": t("admin.dashboardsA.crm.proposalSent"),
    Qualified: t("admin.dashboardsA.crm.qualified"),
  };
  const healthLabels: Record<string, string> = {
    "At Risk": t("admin.dashboardsA.crm.atRisk"),
    "Needs Review": t("admin.dashboardsA.crm.needsReview"),
    "On Hold": t("admin.dashboardsA.crm.onHold"),
    "On Track": t("admin.dashboardsA.crm.onTrack"),
  };

  return [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() ? true : table.getIsSomePageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label={t("admin.dashboardsA.crm.selectAllOpportunities")}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label={t("admin.dashboardsA.crm.selectOpportunity", { account: row.original.account })}
      />
    ),
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: t("admin.dashboardsA.crm.id"),
    cell: ({ row }) => <div className="text-sm tracking-tight">{row.original.id}</div>,
    enableHiding: false,
  },
  {
    accessorKey: "account",
    header: t("admin.dashboardsA.crm.account"),
    cell: ({ row }) => <div className="font-medium text-sm">{row.original.account}</div>,
  },
  {
    accessorKey: "stage",
    header: t("admin.dashboardsA.crm.stage"),
    cell: ({ row }) => (
      <Badge variant="outline" className="rounded-full px-2.5">
        {stageLabels[row.original.stage] ?? row.original.stage}
      </Badge>
    ),
    filterFn: "equalsString",
  },
  {
    accessorKey: "priority",
    header: t("admin.dashboardsA.crm.priority"),
    cell: ({ row }) => <div className="text-sm">{numberFormatter.format(row.original.priority)}</div>,
  },
  {
    accessorKey: "health",
    header: t("admin.dashboardsA.crm.health"),
    cell: ({ row }) => (
      <div className="flex items-end gap-0.5" title={healthLabels[row.original.health] ?? row.original.health}>
        <span className="sr-only">{healthLabels[row.original.health] ?? row.original.health}</span>
        {healthStripSlots.map((slot) => (
          <div
            key={`${row.original.id}-${slot.id}`}
            className={cn(
              "h-5 w-1 rounded-full",
              slot.threshold <= getHealthScore(row.original.health) ? "bg-green-500/85" : "bg-green-500/15",
            )}
          />
        ))}
      </div>
    ),
    filterFn: "equalsString",
  },
  {
    accessorKey: "value",
    header: t("admin.dashboardsA.crm.value"),
    cell: ({ row }) => (
      <div className="font-medium text-sm tabular-nums">
        {currencyFormatter.format(Number(row.original.value.replace(/[^0-9.-]/g, "")))}
      </div>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-right">{t("admin.dashboardsA.crm.edit")}</div>,
    cell: () => (
      <div className="text-right">
        <Button
          variant="ghost"
          size="icon"
          className="size-8 rounded-full text-muted-foreground hover:bg-transparent focus-visible:bg-transparent"
        >
          <Pencil />
          <span className="sr-only">{t("admin.dashboardsA.crm.editOpportunity")}</span>
        </Button>
      </div>
    ),
    enableHiding: false,
  },
  ];
}
