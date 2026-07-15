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
import { useI18n } from "@/components/providers/i18n-provider";
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
import type { SalesAdminManagementTranslationKey } from "@/lib/i18n/messages/sales-admin-management";

import { getSaleCampaignPhase } from "../_data/sale-campaign-form";

const ALL_FILTER = "ALL";

const SALE_TYPES: SaleCampaignType[] = ["STANDARD", "FLASH"];
const SALE_STATUSES: SaleCampaignStatus[] = ["DRAFT", "PUBLISHED", "CANCELLED"];
const SALE_PHASES: SaleCampaignPhase[] = ["UPCOMING", "LIVE", "ENDED"];

const TYPE_LABEL_KEYS: Record<SaleCampaignType, SalesAdminManagementTranslationKey> = {
  STANDARD: "admin.sales.management.type.standard",
  FLASH: "admin.sales.management.type.flash",
};

const STATUS_LABEL_KEYS: Record<SaleCampaignStatus, SalesAdminManagementTranslationKey> = {
  DRAFT: "admin.sales.management.status.draft",
  PUBLISHED: "admin.sales.management.status.published",
  CANCELLED: "admin.sales.management.status.cancelled",
};

const PHASE_LABEL_KEYS: Record<SaleCampaignPhase, SalesAdminManagementTranslationKey> = {
  UPCOMING: "admin.sales.management.phase.upcoming",
  LIVE: "admin.sales.management.phase.live",
  ENDED: "admin.sales.management.phase.ended",
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
  const { locale, t } = useI18n();
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
    locale,
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
        toast.success(t("admin.sales.management.toast.published", { name: published.name }));
      } else {
        await deleteMutation.mutateAsync(action.campaign.id);
        toast.success(
          t("admin.sales.management.toast.deleted", { name: action.campaign.name }),
        );
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
      header: t("admin.sales.management.column.campaign"),
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
            <div className="mt-1 flex gap-1">
              {(["vi", "en"] as const).map((translationLocale) => (
                <Badge
                  key={translationLocale}
                  variant={campaign.translationLocales?.includes(translationLocale) ? "secondary" : "outline"}
                  className="px-1 py-0 text-[9px] uppercase"
                >
                  {translationLocale}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "type",
      header: t("admin.sales.management.column.typeItems"),
      cell: (campaign) => (
        <div className="grid gap-1">
          <Badge
            variant={campaign.type === "FLASH" ? "default" : "secondary"}
            className="w-fit"
          >
            {t(TYPE_LABEL_KEYS[campaign.type])}
          </Badge>
          <span className="text-muted-foreground text-xs tabular-nums">
            {t("admin.sales.management.variantCount", {
              count: campaign.items.length,
            })}
          </span>
        </div>
      ),
    },
    {
      key: "schedule",
      header: t("admin.sales.management.column.schedule"),
      className: "whitespace-nowrap",
      cell: (campaign) => (
        <div className="grid gap-0.5">
          <span>{formatAdminDateTime(campaign.startsAt, locale)}</span>
          <span className="text-muted-foreground text-xs">
            {t("admin.sales.management.scheduleTo", {
              date: formatAdminDateTime(campaign.endsAt, locale),
            })}
          </span>
        </div>
      ),
    },
    {
      key: "quota",
      header: t("admin.sales.management.column.flashQuota"),
      className: "min-w-48",
      cell: (campaign) => {
        if (campaign.type !== "FLASH") {
          return (
            <span className="text-muted-foreground">
              {t("admin.sales.management.quota.none")}
            </span>
          );
        }
        const { totalQuota, reservedQuantity, soldQuantity } =
          campaignTotals(campaign);
        const used = reservedQuantity + soldQuantity;
        const percentage = totalQuota > 0 ? (used / totalQuota) * 100 : 0;
        return (
          <div className="grid gap-1.5">
            <div className="flex justify-between text-xs tabular-nums">
              <span>
                {t("admin.sales.management.quota.allocated", { count: used })}
              </span>
              <span className="text-muted-foreground">
                {t("admin.sales.management.quota.total", { count: totalQuota })}
              </span>
            </div>
            <Progress value={Math.min(100, percentage)} />
            <p className="text-muted-foreground text-xs tabular-nums">
              {t("admin.sales.management.quota.breakdown", {
                reserved: reservedQuantity,
                sold: soldQuantity,
              })}
            </p>
          </div>
        );
      },
    },
    {
      key: "lifecycle",
      header: t("admin.sales.management.column.lifecycle"),
      cell: (campaign) => {
        const phase = getSaleCampaignPhase(campaign);
        return (
          <div className="flex flex-wrap gap-1.5">
            <Badge variant={statusVariant(campaign.status)}>
              {t(STATUS_LABEL_KEYS[campaign.status])}
            </Badge>
            <Badge variant={phaseVariant(phase)}>{t(PHASE_LABEL_KEYS[phase])}</Badge>
          </div>
        );
      },
    },
    {
      key: "actions",
      header: (
        <span className="sr-only">
          {t("admin.sales.management.column.actions")}
        </span>
      ),
      headerClassName: "w-32 text-right",
      className: "text-right",
      cell: (campaign) => (
        <div className="flex justify-end gap-1">
          {campaign.status === "DRAFT" ? (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={t("admin.sales.management.action.publishAria", {
                name: campaign.name,
              })}
              title={t("admin.sales.management.action.publishTitle")}
              onClick={() => setAction({ campaign, type: "PUBLISH" })}
              disabled={isActionPending}
            >
              <Rocket />
            </Button>
          ) : null}
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("admin.sales.management.action.viewAria", {
              name: campaign.name,
            })}
            render={<Link href={`/dashboard/sales/${campaign.id}`} />}
          >
            <Eye />
          </Button>
          {campaign.status === "DRAFT" ? (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={t("admin.sales.management.action.deleteAria", {
                name: campaign.name,
              })}
              title={t("admin.sales.management.action.deleteTitle")}
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
        title={t("admin.sales.management.title")}
        description={t("admin.sales.management.description")}
        rows={rows}
        columns={columns}
        total={meta?.total ?? 0}
        page={meta?.page ?? page}
        pageSize={pageSize}
        pageCount={meta?.pages ?? 0}
        searchValue={searchValue}
        searchPlaceholder={t("admin.sales.management.searchPlaceholder")}
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
            label: t("admin.sales.management.filter.type"),
            value: typeFilter,
            options: [
              { label: t("admin.sales.management.filter.allTypes"), value: ALL_FILTER },
              ...SALE_TYPES.map((value) => ({
                value,
                label: t(TYPE_LABEL_KEYS[value]),
              })),
            ],
            onValueChange: (value) => {
              setTypeFilter(value ?? ALL_FILTER);
              setPage(1);
            },
          },
          {
            label: t("admin.sales.management.filter.status"),
            value: statusFilter,
            options: [
              {
                label: t("admin.sales.management.filter.allStatuses"),
                value: ALL_FILTER,
              },
              ...SALE_STATUSES.map((value) => ({
                value,
                label: t(STATUS_LABEL_KEYS[value]),
              })),
            ],
            onValueChange: (value) => {
              setStatusFilter(value ?? ALL_FILTER);
              setPage(1);
            },
          },
          {
            label: t("admin.sales.management.filter.phase"),
            value: phaseFilter,
            options: [
              { label: t("admin.sales.management.filter.allPhases"), value: ALL_FILTER },
              ...SALE_PHASES.map((value) => ({
                value,
                label: t(PHASE_LABEL_KEYS[value]),
              })),
            ],
            onValueChange: (value) => {
              setPhaseFilter(value ?? ALL_FILTER);
              setPage(1);
            },
          },
        ]}
        primaryAction={{
          label: t("admin.sales.management.create"),
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
                type: t(TYPE_LABEL_KEYS[campaign.type]),
                status: t(STATUS_LABEL_KEYS[campaign.status]),
                phase: t(PHASE_LABEL_KEYS[getSaleCampaignPhase(campaign)]),
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
        emptyTitle={t("admin.sales.management.emptyTitle")}
        emptyDescription={t("admin.sales.management.emptyDescription")}
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
                ? t("admin.sales.management.dialog.publishTitle")
                : t("admin.sales.management.dialog.deleteTitle")}
            </DialogTitle>
            <DialogDescription>
              {action?.type === "PUBLISH"
                ? t("admin.sales.management.dialog.publishDescription")
                : t("admin.sales.management.dialog.deleteDescription")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAction(null)}
              disabled={isActionPending}
            >
              {t("admin.sales.management.dialog.cancel")}
            </Button>
            <Button
              variant={action?.type === "DELETE" ? "destructive" : "default"}
              onClick={() => void performAction()}
              disabled={isActionPending}
            >
              {isActionPending ? <Loader2 className="animate-spin" /> : null}
              {action?.type === "PUBLISH"
                ? t("admin.sales.management.dialog.publish")
                : t("admin.sales.management.dialog.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
