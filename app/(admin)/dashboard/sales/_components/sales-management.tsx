"use client";

import { useDeferredValue, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, Loader2, Rocket, Tags, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  type ManagementColumn,
  ResourcePage,
} from "@/app/(admin)/dashboard/_components/management/resource-page";
import {
  downloadCsv,
  formatAdminDateTime,
  getApiErrorMessage,
} from "@/app/(admin)/dashboard/_components/management/resource-utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import type {
  AdminSaleCampaign,
  SaleCampaignPhase,
  SaleCampaignStatus,
  SaleCampaignType,
} from "@/lib/api/admin-sales";
import {
  useAdminSaleCampaignsQuery,
  useDeleteAdminSaleCampaignMutation,
  usePublishAdminSaleCampaignMutation,
} from "@/lib/queries/admin-sales";

import { getSaleCampaignPhase } from "../_data/sale-campaign-form";

const ALL_FILTER = "ALL";

const TYPE_LABELS: Record<SaleCampaignType, string> = {
  STANDARD: "Standard",
  FLASH: "Flash",
};

const STATUS_LABELS: Record<SaleCampaignStatus, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  CANCELLED: "Cancelled",
};

const PHASE_LABELS: Record<SaleCampaignPhase, string> = {
  UPCOMING: "Upcoming",
  LIVE: "Live",
  ENDED: "Ended",
};

type ListAction = {
  campaign: AdminSaleCampaign;
  type: "PUBLISH" | "DELETE";
};

function phaseVariant(phase: SaleCampaignPhase) {
  if (phase === "LIVE") return "default" as const;
  if (phase === "UPCOMING") return "secondary" as const;
  return "outline" as const;
}

function statusVariant(status: SaleCampaignStatus) {
  if (status === "CANCELLED") return "destructive" as const;
  if (status === "DRAFT") return "secondary" as const;
  return "outline" as const;
}

function campaignTotals(campaign: AdminSaleCampaign) {
  const totalQuota = campaign.items.reduce(
    (sum, item) => sum + (item.quota ?? 0),
    0,
  );
  const reservedQuantity = campaign.items.reduce(
    (sum, item) => sum + item.reservedQuantity,
    0,
  );
  const soldQuantity = campaign.items.reduce(
    (sum, item) => sum + item.soldQuantity,
    0,
  );
  return { totalQuota, reservedQuantity, soldQuantity };
}

export function SalesManagement() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchValue, setSearchValue] = useState("");
  const [typeFilter, setTypeFilter] = useState(ALL_FILTER);
  const [statusFilter, setStatusFilter] = useState(ALL_FILTER);
  const [phaseFilter, setPhaseFilter] = useState(ALL_FILTER);
  const [action, setAction] = useState<ListAction | null>(null);
  const deferredSearch = useDeferredValue(searchValue.trim());

  const campaignsQuery = useAdminSaleCampaignsQuery({
    page,
    size: pageSize,
    sort: "createdAt,desc",
    search: deferredSearch || undefined,
    type:
      typeFilter === ALL_FILTER ? undefined : (typeFilter as SaleCampaignType),
    status:
      statusFilter === ALL_FILTER
        ? undefined
        : (statusFilter as SaleCampaignStatus),
    phase:
      phaseFilter === ALL_FILTER
        ? undefined
        : (phaseFilter as SaleCampaignPhase),
  });
  const publishMutation = usePublishAdminSaleCampaignMutation();
  const deleteMutation = useDeleteAdminSaleCampaignMutation();
  const rows = campaignsQuery.data?.result ?? [];
  const meta = campaignsQuery.data?.meta;
  const isActionPending = publishMutation.isPending || deleteMutation.isPending;

  async function performAction() {
    if (!action) return;
    try {
      if (action.type === "PUBLISH") {
        const published = await publishMutation.mutateAsync({
          id: action.campaign.id,
          version: action.campaign.version,
        });
        toast.success(`${published.name} was published.`);
      } else {
        await deleteMutation.mutateAsync(action.campaign.id);
        toast.success(`${action.campaign.name} was deleted.`);
        setPage(1);
      }
      setAction(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      setAction(null);
      void campaignsQuery.refetch();
    }
  }

  const columns: ManagementColumn<AdminSaleCampaign>[] = [
    {
      key: "campaign",
      header: "Campaign",
      className: "min-w-64",
      cell: (campaign) => (
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Tags className="size-4" />
          </div>
          <div className="min-w-0">
            <Link
              className="block truncate font-medium hover:underline"
              href={`/dashboard/sales/${campaign.id}`}
            >
              {campaign.name}
            </Link>
            <p className="truncate font-mono text-muted-foreground text-xs">
              {campaign.code}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type / items",
      cell: (campaign) => (
        <div className="grid gap-1">
          <Badge
            variant={campaign.type === "FLASH" ? "default" : "secondary"}
            className="w-fit"
          >
            {TYPE_LABELS[campaign.type]}
          </Badge>
          <span className="text-muted-foreground text-xs tabular-nums">
            {campaign.items.length} variant(s)
          </span>
        </div>
      ),
    },
    {
      key: "schedule",
      header: "Schedule",
      className: "whitespace-nowrap",
      cell: (campaign) => (
        <div className="grid gap-0.5">
          <span>{formatAdminDateTime(campaign.startsAt)}</span>
          <span className="text-muted-foreground text-xs">
            to {formatAdminDateTime(campaign.endsAt)}
          </span>
        </div>
      ),
    },
    {
      key: "quota",
      header: "Flash quota",
      className: "min-w-48",
      cell: (campaign) => {
        if (campaign.type !== "FLASH") {
          return <span className="text-muted-foreground">No quota</span>;
        }
        const { totalQuota, reservedQuantity, soldQuantity } =
          campaignTotals(campaign);
        const used = reservedQuantity + soldQuantity;
        const percentage = totalQuota > 0 ? (used / totalQuota) * 100 : 0;
        return (
          <div className="grid gap-1.5">
            <div className="flex justify-between text-xs tabular-nums">
              <span>{used} allocated</span>
              <span className="text-muted-foreground">{totalQuota} total</span>
            </div>
            <Progress value={Math.min(100, percentage)} />
            <p className="text-muted-foreground text-xs tabular-nums">
              {reservedQuantity} reserved · {soldQuantity} sold
            </p>
          </div>
        );
      },
    },
    {
      key: "lifecycle",
      header: "Lifecycle",
      cell: (campaign) => {
        const phase = getSaleCampaignPhase(campaign);
        return (
          <div className="flex flex-wrap gap-1.5">
            <Badge variant={statusVariant(campaign.status)}>
              {STATUS_LABELS[campaign.status]}
            </Badge>
            <Badge variant={phaseVariant(phase)}>{PHASE_LABELS[phase]}</Badge>
          </div>
        );
      },
    },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      headerClassName: "w-32 text-right",
      className: "text-right",
      cell: (campaign) => (
        <div className="flex justify-end gap-1">
          {campaign.status === "DRAFT" ? (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Publish ${campaign.name}`}
              title="Publish campaign"
              onClick={() => setAction({ campaign, type: "PUBLISH" })}
              disabled={isActionPending}
            >
              <Rocket />
            </Button>
          ) : null}
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`View ${campaign.name}`}
            render={<Link href={`/dashboard/sales/${campaign.id}`} />}
          >
            <Eye />
          </Button>
          {campaign.status === "DRAFT" ? (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Delete ${campaign.name}`}
              title="Delete draft"
              onClick={() => setAction({ campaign, type: "DELETE" })}
              disabled={isActionPending}
            >
              <Trash2 />
            </Button>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <>
      <ResourcePage
        title="Sale campaigns"
        description="Schedule Standard sales and quota-controlled Flash sales. Coupon rules are managed separately."
        rows={rows}
        columns={columns}
        total={meta?.total ?? 0}
        page={meta?.page ?? page}
        pageSize={pageSize}
        pageCount={meta?.pages ?? 0}
        searchValue={searchValue}
        searchPlaceholder="Search campaign name or code..."
        onSearchChange={(value) => {
          setSearchValue(value);
          setPage(1);
        }}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        filters={[
          {
            label: "Type",
            value: typeFilter,
            options: [
              { label: "All types", value: ALL_FILTER },
              ...Object.entries(TYPE_LABELS).map(([value, label]) => ({
                value,
                label,
              })),
            ],
            onValueChange: (value) => {
              setTypeFilter(value ?? ALL_FILTER);
              setPage(1);
            },
          },
          {
            label: "Status",
            value: statusFilter,
            options: [
              { label: "All statuses", value: ALL_FILTER },
              ...Object.entries(STATUS_LABELS).map(([value, label]) => ({
                value,
                label,
              })),
            ],
            onValueChange: (value) => {
              setStatusFilter(value ?? ALL_FILTER);
              setPage(1);
            },
          },
          {
            label: "Phase",
            value: phaseFilter,
            options: [
              { label: "All phases", value: ALL_FILTER },
              ...Object.entries(PHASE_LABELS).map(([value, label]) => ({
                value,
                label,
              })),
            ],
            onValueChange: (value) => {
              setPhaseFilter(value ?? ALL_FILTER);
              setPage(1);
            },
          },
        ]}
        primaryAction={{
          label: "Create campaign",
          onClick: () => router.push("/dashboard/sales/new"),
        }}
        onRefresh={() => void campaignsQuery.refetch()}
        onExport={() =>
          downloadCsv(
            "sale-campaigns.csv",
            rows.map((campaign) => {
              const totals = campaignTotals(campaign);
              return {
                id: campaign.id,
                code: campaign.code,
                name: campaign.name,
                type: campaign.type,
                status: campaign.status,
                phase: getSaleCampaignPhase(campaign),
                startsAt: campaign.startsAt,
                endsAt: campaign.endsAt,
                itemCount: campaign.items.length,
                totalQuota:
                  campaign.type === "FLASH" ? totals.totalQuota : null,
                reservedQuantity:
                  campaign.type === "FLASH" ? totals.reservedQuantity : null,
                soldQuantity:
                  campaign.type === "FLASH" ? totals.soldQuantity : null,
              };
            }),
          )
        }
        isLoading={campaignsQuery.isPending}
        isFetching={campaignsQuery.isFetching}
        error={campaignsQuery.isError ? campaignsQuery.error : null}
        emptyTitle="No sale campaigns found"
        emptyDescription="Create a campaign or adjust the current search and filters."
      />

      <Dialog
        open={action !== null}
        onOpenChange={(open) => {
          if (!open && !isActionPending) setAction(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action?.type === "PUBLISH"
                ? "Publish this campaign?"
                : "Delete this draft?"}
            </DialogTitle>
            <DialogDescription>
              {action?.type === "PUBLISH"
                ? "Publishing validates price, schedule, variant overlap, and Flash quota inside one backend transaction."
                : "The draft and all configured campaign items will be permanently removed."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAction(null)}
              disabled={isActionPending}
            >
              Cancel
            </Button>
            <Button
              variant={action?.type === "DELETE" ? "destructive" : "default"}
              onClick={() => void performAction()}
              disabled={isActionPending}
            >
              {isActionPending ? <Loader2 className="animate-spin" /> : null}
              {action?.type === "PUBLISH" ? "Publish" : "Delete draft"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
