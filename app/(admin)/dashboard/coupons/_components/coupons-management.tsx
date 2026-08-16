"use client";

import { type FormEvent, useDeferredValue, useState } from "react";
import { Pencil, Tag, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  type ManagementColumn,
  ResourcePage,
} from "@/app/(admin)/dashboard/_components/management/resource-page";
import {
  DeleteResourceDialog,
  ResourceFormSheet,
} from "@/app/(admin)/dashboard/_components/management/resource-overlays";
import {
  downloadCsv,
  getApiErrorMessage,
} from "@/app/(admin)/dashboard/_components/management/resource-utils";
import { useI18n } from "@/components/providers/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  AdminCoupon,
  CouponStatus,
  CouponType,
  CreateAdminCouponRequest,
  UpdateAdminCouponRequest,
} from "@/lib/api/admin-commerce";
import { formatCurrency, formatDate, formatNumber } from "@/lib/i18n/format";
import {
  useAdminCouponsQuery,
  useCreateAdminCouponMutation,
  useDeleteAdminCouponMutation,
  useUpdateAdminCouponMutation,
} from "@/lib/queries/admin-commerce";

import {
  CouponForm,
  createEmptyCouponForm,
  toLocalDateTimeInput,
  type CouponFormValues,
} from "./coupon-form";

const ALL_FILTER = "ALL";

const COUPON_STATUS_MESSAGE_KEYS = {
  ACTIVE: "admin.commerce.coupons.status.active",
  INACTIVE: "admin.commerce.coupons.status.inactive",
  EXPIRED: "admin.commerce.coupons.status.expired",
} as const;

const COUPON_TYPE_MESSAGE_KEYS = {
  PERCENTAGE: "admin.commerce.coupons.type.percentage",
  FIXED_AMOUNT: "admin.commerce.coupons.type.fixedAmount",
} as const;

const COUPON_STATUSES: CouponStatus[] = ["ACTIVE", "INACTIVE", "EXPIRED"];
const COUPON_TYPES: CouponType[] = ["PERCENTAGE", "FIXED_AMOUNT"];

function getStatusVariant(status: CouponStatus) {
  if (status === "ACTIVE") return "default" as const;
  if (status === "EXPIRED") return "outline" as const;
  return "secondary" as const;
}

function formatCouponValue(coupon: AdminCoupon, locale: ReturnType<typeof useI18n>["locale"]) {
  if (coupon.type === "PERCENTAGE") {
    return `${formatNumber(coupon.value, locale, { maximumFractionDigits: 2 })}%`;
  }
  return formatCurrency(coupon.value, locale);
}

function toFormValues(coupon: AdminCoupon): CouponFormValues {
  return {
    code: coupon.code,
    type: coupon.type,
    value: String(coupon.value),
    minOrderAmount: String(coupon.minOrderAmount),
    maxDiscount: coupon.maxDiscount === null ? "" : String(coupon.maxDiscount),
    usageLimit: coupon.usageLimit === null ? "" : String(coupon.usageLimit),
    startDate: toLocalDateTimeInput(coupon.startDate),
    endDate: toLocalDateTimeInput(coupon.endDate),
    status: coupon.status,
  };
}

function parseOptionalNumber(value: string) {
  return value.trim() === "" ? null : Number(value);
}

export function CouponsManagement() {
  const { locale, t } = useI18n();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState(ALL_FILTER);
  const [typeFilter, setTypeFilter] = useState(ALL_FILTER);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<AdminCoupon | null>(null);
  const [deleteCoupon, setDeleteCoupon] = useState<AdminCoupon | null>(null);
  const [formValues, setFormValues] = useState<CouponFormValues>(() => createEmptyCouponForm());
  const deferredSearch = useDeferredValue(searchValue.trim());

  const couponsQuery = useAdminCouponsQuery({
    page,
    size: pageSize,
    sort: "id,desc",
    code: deferredSearch || undefined,
    status: statusFilter === ALL_FILTER ? undefined : (statusFilter as CouponStatus),
    type: typeFilter === ALL_FILTER ? undefined : (typeFilter as CouponType),
  });
  const createMutation = useCreateAdminCouponMutation();
  const updateMutation = useUpdateAdminCouponMutation();
  const deleteMutation = useDeleteAdminCouponMutation();

  const rows = couponsQuery.data?.result ?? [];
  const meta = couponsQuery.data?.meta;
  const isSaving = createMutation.isPending || updateMutation.isPending;

  function openCreateForm() {
    setEditingCoupon(null);
    setFormValues(createEmptyCouponForm());
    setFormOpen(true);
  }

  function openEditForm(coupon: AdminCoupon) {
    setEditingCoupon(coupon);
    setFormValues(toFormValues(coupon));
    setFormOpen(true);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const code = formValues.code.trim().toUpperCase();
    const value = Number(formValues.value);
    const minOrderAmount = Number(formValues.minOrderAmount);
    const maxDiscount = parseOptionalNumber(formValues.maxDiscount);
    const usageLimit = parseOptionalNumber(formValues.usageLimit);
    const startDate = new Date(formValues.startDate);
    const endDate = new Date(formValues.endDate);

    if (!editingCoupon && !code) {
      toast.error(t("admin.commerce.coupons.validation.code"));
      return;
    }
    if (
      !Number.isFinite(value) ||
      value < 0 ||
      !Number.isFinite(minOrderAmount) ||
      minOrderAmount < 0
    ) {
      toast.error(t("admin.commerce.coupons.validation.amounts"));
      return;
    }
    if (formValues.type === "PERCENTAGE" && value > 100) {
      toast.error(t("admin.commerce.coupons.validation.percentage"));
      return;
    }
    if (maxDiscount !== null && (!Number.isFinite(maxDiscount) || maxDiscount < 0)) {
      toast.error(t("admin.commerce.coupons.validation.maxDiscount"));
      return;
    }
    if (usageLimit !== null && (!Number.isInteger(usageLimit) || usageLimit < 0)) {
      toast.error(t("admin.commerce.coupons.validation.usageLimit"));
      return;
    }
    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime()) ||
      endDate <= startDate
    ) {
      toast.error(t("admin.commerce.coupons.validation.dates"));
      return;
    }

    const commonRequest: UpdateAdminCouponRequest = {
      type: formValues.type,
      value,
      minOrderAmount,
      maxDiscount,
      usageLimit,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      status: formValues.status,
    };

    if (editingCoupon) {
      updateMutation.mutate(
        { id: editingCoupon.id, request: commonRequest },
        {
          onSuccess: () => {
            toast.success(t("admin.commerce.coupons.updated", { code: editingCoupon.code }));
            setFormOpen(false);
            setEditingCoupon(null);
          },
          onError: (error) => toast.error(getApiErrorMessage(error)),
        },
      );
      return;
    }

    const request: CreateAdminCouponRequest = { ...commonRequest, code };
    createMutation.mutate(request, {
      onSuccess: () => {
        toast.success(t("admin.commerce.coupons.created", { code }));
        setPage(1);
        setFormOpen(false);
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  }

  function handleDelete() {
    if (!deleteCoupon) return;
    if (deleteCoupon.usedCount > 0) {
      toast.error(t("admin.commerce.coupons.usedCannotDelete"));
      return;
    }

    const { id, code } = deleteCoupon;
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success(t("admin.commerce.coupons.deleted", { code }));
        setDeleteCoupon(null);
        setPage(1);
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  }

  const columns: ManagementColumn<AdminCoupon>[] = [
    {
      key: "code",
      header: t("admin.commerce.coupons.column.coupon"),
      className: "min-w-44",
      cell: (coupon) => (
        <div className="flex items-center gap-3">
          <div className="bg-muted text-muted-foreground flex size-9 items-center justify-center rounded-lg">
            <Tag className="size-4" />
          </div>
          <div>
            <p className="font-mono font-medium">{coupon.code}</p>
            <p className="text-muted-foreground text-xs">
              {t(COUPON_TYPE_MESSAGE_KEYS[coupon.type])}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "discount",
      header: t("admin.commerce.coupons.column.discount"),
      className: "whitespace-nowrap tabular-nums",
      cell: (coupon) => (
        <div className="space-y-0.5">
          <p className="font-medium">{formatCouponValue(coupon, locale)}</p>
          <p className="text-muted-foreground text-xs">
            {t("admin.commerce.coupons.minimum", {
              amount: formatCurrency(coupon.minOrderAmount, locale),
            })}
          </p>
        </div>
      ),
    },
    {
      key: "usage",
      header: t("admin.commerce.coupons.column.usage"),
      className: "whitespace-nowrap tabular-nums",
      cell: (coupon) => (
        <div className="space-y-0.5">
          <p className="font-medium">
            {formatNumber(coupon.usedCount, locale)} /{" "}
            {coupon.usageLimit === null ? "∞" : formatNumber(coupon.usageLimit, locale)}
          </p>
          <p className="text-muted-foreground text-xs">
            {coupon.usedCount > 0
              ? t("admin.commerce.coupons.protected")
              : t("admin.commerce.coupons.notUsed")}
          </p>
        </div>
      ),
    },
    {
      key: "validity",
      header: t("admin.commerce.coupons.column.validity"),
      className: "whitespace-nowrap",
      cell: (coupon) => (
        <div className="space-y-0.5">
          <p>{formatDate(coupon.startDate, locale)}</p>
          <p className="text-muted-foreground text-xs">
            {t("admin.commerce.coupons.validTo", {
              date: formatDate(coupon.endDate, locale),
            })}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      header: t("admin.commerce.common.status"),
      cell: (coupon) => (
        <Badge variant={getStatusVariant(coupon.status)}>
          {t(COUPON_STATUS_MESSAGE_KEYS[coupon.status])}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: <span className="sr-only">{t("admin.commerce.common.actions")}</span>,
      headerClassName: "w-24 text-right",
      className: "text-right",
      cell: (coupon) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("admin.commerce.coupons.editNamed", { code: coupon.code })}
            onClick={() => openEditForm(coupon)}
          >
            <Pencil />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={
              coupon.usedCount > 0
                ? t("admin.commerce.coupons.usedDeleteAria", { code: coupon.code })
                : t("admin.commerce.coupons.deleteNamed", { code: coupon.code })
            }
            title={
              coupon.usedCount > 0
                ? t("admin.commerce.coupons.usedDeleteTitle")
                : t("admin.commerce.coupons.deleteNamed", { code: coupon.code })
            }
            disabled={coupon.usedCount > 0}
            onClick={() => setDeleteCoupon(coupon)}
          >
            <Trash2 />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <ResourcePage
        title={t("admin.commerce.coupons.title")}
        description={t("admin.commerce.coupons.description")}
        rows={rows}
        columns={columns}
        total={meta?.total ?? 0}
        page={meta?.page ?? page}
        pageSize={pageSize}
        pageCount={meta?.pages ?? 0}
        searchValue={searchValue}
        searchPlaceholder={t("admin.commerce.coupons.search")}
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
            label: t("admin.commerce.common.status"),
            value: statusFilter,
            options: [
              { label: t("admin.commerce.common.allStatuses"), value: ALL_FILTER },
              ...COUPON_STATUSES.map((value) => ({
                value,
                label: t(COUPON_STATUS_MESSAGE_KEYS[value]),
              })),
            ],
            onValueChange: (value) => {
              setStatusFilter(value ?? ALL_FILTER);
              setPage(1);
            },
          },
          {
            label: t("admin.commerce.coupons.filter.type"),
            value: typeFilter,
            options: [
              { label: t("admin.commerce.coupons.filter.allTypes"), value: ALL_FILTER },
              ...COUPON_TYPES.map((value) => ({
                value,
                label: t(COUPON_TYPE_MESSAGE_KEYS[value]),
              })),
            ],
            onValueChange: (value) => {
              setTypeFilter(value ?? ALL_FILTER);
              setPage(1);
            },
          },
        ]}
        primaryAction={{ label: t("admin.commerce.coupons.add"), onClick: openCreateForm }}
        onRefresh={() => void couponsQuery.refetch()}
        onExport={() =>
          downloadCsv(
            "coupons.csv",
            rows.map((coupon) => ({
              id: coupon.id,
              code: coupon.code,
              type: t(COUPON_TYPE_MESSAGE_KEYS[coupon.type]),
              value: coupon.value,
              minOrderAmount: coupon.minOrderAmount,
              maxDiscount: coupon.maxDiscount,
              usageLimit: coupon.usageLimit,
              usedCount: coupon.usedCount,
              startDate: coupon.startDate,
              endDate: coupon.endDate,
              status: t(COUPON_STATUS_MESSAGE_KEYS[coupon.status]),
            })),
          )
        }
        isLoading={couponsQuery.isPending}
        isFetching={couponsQuery.isFetching}
        error={couponsQuery.isError ? couponsQuery.error : null}
        emptyTitle={t("admin.commerce.coupons.emptyTitle")}
        emptyDescription={t("admin.commerce.coupons.emptyDescription")}
      />

      <ResourceFormSheet
        open={formOpen}
        onOpenChange={(open) => {
          if (!isSaving) setFormOpen(open);
        }}
        title={editingCoupon ? t("admin.commerce.coupons.edit") : t("admin.commerce.coupons.add")}
        description={t("admin.commerce.coupons.formDescription")}
        onSubmit={handleSubmit}
        isPending={isSaving}
        submitLabel={
          editingCoupon ? t("admin.commerce.coupons.save") : t("admin.commerce.coupons.create")
        }
      >
        <CouponForm
          values={formValues}
          onChange={setFormValues}
          isEditing={Boolean(editingCoupon)}
        />
      </ResourceFormSheet>

      <DeleteResourceDialog
        open={Boolean(deleteCoupon)}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) setDeleteCoupon(null);
        }}
        resourceName={deleteCoupon?.code ?? t("admin.commerce.coupons.resource")}
        description={t("admin.commerce.coupons.deleteDescription")}
        onConfirm={handleDelete}
        isPending={deleteMutation.isPending}
      />
    </>
  );
}
