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
  formatAdminDate,
  formatCurrency,
  getApiErrorMessage,
} from "@/app/(admin)/dashboard/_components/management/resource-utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  AdminCoupon,
  CouponStatus,
  CouponType,
  CreateAdminCouponRequest,
  UpdateAdminCouponRequest,
} from "@/lib/api/admin-commerce";
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

const COUPON_STATUS_LABELS: Record<CouponStatus, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  EXPIRED: "Expired",
};

const COUPON_TYPE_LABELS: Record<CouponType, string> = {
  PERCENTAGE: "Percentage",
  FIXED_AMOUNT: "Fixed amount",
};

function getStatusVariant(status: CouponStatus) {
  if (status === "ACTIVE") return "default" as const;
  if (status === "EXPIRED") return "outline" as const;
  return "secondary" as const;
}

function formatCouponValue(coupon: AdminCoupon) {
  if (coupon.type === "PERCENTAGE") {
    return `${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 }).format(coupon.value)}%`;
  }
  return formatCurrency(coupon.value);
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
      toast.error("Enter a coupon code before saving.");
      return;
    }
    if (!Number.isFinite(value) || value < 0 || !Number.isFinite(minOrderAmount) || minOrderAmount < 0) {
      toast.error("Coupon value and minimum order must be valid non-negative numbers.");
      return;
    }
    if (formValues.type === "PERCENTAGE" && value > 100) {
      toast.error("A percentage coupon cannot exceed 100%.");
      return;
    }
    if (maxDiscount !== null && (!Number.isFinite(maxDiscount) || maxDiscount < 0)) {
      toast.error("Maximum discount must be a non-negative number.");
      return;
    }
    if (usageLimit !== null && (!Number.isInteger(usageLimit) || usageLimit < 0)) {
      toast.error("Usage limit must be a non-negative whole number.");
      return;
    }
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate <= startDate) {
      toast.error("End date must be later than start date.");
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
            toast.success(`${editingCoupon.code} was updated.`);
            setFormOpen(false);
            setEditingCoupon(null);
          },
          onError: (error) => toast.error(getApiErrorMessage(error)),
        }
      );
      return;
    }

    const request: CreateAdminCouponRequest = { ...commonRequest, code };
    createMutation.mutate(request, {
      onSuccess: () => {
        toast.success(`${code} was created.`);
        setPage(1);
        setFormOpen(false);
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  }

  function handleDelete() {
    if (!deleteCoupon) return;
    if (deleteCoupon.usedCount > 0) {
      toast.error("Used coupons cannot be deleted. Set the coupon to inactive instead.");
      return;
    }

    const { id, code } = deleteCoupon;
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success(`${code} was deleted.`);
        setDeleteCoupon(null);
        setPage(1);
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  }

  const columns: ManagementColumn<AdminCoupon>[] = [
    {
      key: "code",
      header: "Coupon",
      className: "min-w-44",
      cell: (coupon) => (
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Tag className="size-4" />
          </div>
          <div>
            <p className="font-mono font-medium">{coupon.code}</p>
            <p className="text-muted-foreground text-xs">{COUPON_TYPE_LABELS[coupon.type]}</p>
          </div>
        </div>
      ),
    },
    {
      key: "discount",
      header: "Discount",
      className: "whitespace-nowrap tabular-nums",
      cell: (coupon) => (
        <div className="space-y-0.5">
          <p className="font-medium">{formatCouponValue(coupon)}</p>
          <p className="text-muted-foreground text-xs">Min. {formatCurrency(coupon.minOrderAmount)}</p>
        </div>
      ),
    },
    {
      key: "usage",
      header: "Usage",
      className: "whitespace-nowrap tabular-nums",
      cell: (coupon) => (
        <div className="space-y-0.5">
          <p className="font-medium">
            {coupon.usedCount} / {coupon.usageLimit ?? "∞"}
          </p>
          <p className="text-muted-foreground text-xs">
            {coupon.usedCount > 0 ? "Protected from deletion" : "Not used yet"}
          </p>
        </div>
      ),
    },
    {
      key: "validity",
      header: "Validity",
      className: "whitespace-nowrap",
      cell: (coupon) => (
        <div className="space-y-0.5">
          <p>{formatAdminDate(coupon.startDate)}</p>
          <p className="text-muted-foreground text-xs">to {formatAdminDate(coupon.endDate)}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (coupon) => (
        <Badge variant={getStatusVariant(coupon.status)}>{COUPON_STATUS_LABELS[coupon.status]}</Badge>
      ),
    },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      headerClassName: "w-24 text-right",
      className: "text-right",
      cell: (coupon) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon-sm" aria-label={`Edit ${coupon.code}`} onClick={() => openEditForm(coupon)}>
            <Pencil />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={coupon.usedCount > 0 ? `${coupon.code} cannot be deleted because it has been used` : `Delete ${coupon.code}`}
            title={coupon.usedCount > 0 ? "Used coupons cannot be deleted" : `Delete ${coupon.code}`}
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
        title="Coupons"
        description="Create and schedule promotions. Coupons with usage history are retained and should be marked inactive instead of deleted."
        rows={rows}
        columns={columns}
        total={meta?.total ?? 0}
        page={meta?.page ?? page}
        pageSize={pageSize}
        pageCount={meta?.pages ?? 0}
        searchValue={searchValue}
        searchPlaceholder="Search coupon codes..."
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
            label: "Status",
            value: statusFilter,
            options: [
              { label: "All statuses", value: ALL_FILTER },
              ...Object.entries(COUPON_STATUS_LABELS).map(([value, label]) => ({ value, label })),
            ],
            onValueChange: (value) => {
              setStatusFilter(value ?? ALL_FILTER);
              setPage(1);
            },
          },
          {
            label: "Type",
            value: typeFilter,
            options: [
              { label: "All types", value: ALL_FILTER },
              ...Object.entries(COUPON_TYPE_LABELS).map(([value, label]) => ({ value, label })),
            ],
            onValueChange: (value) => {
              setTypeFilter(value ?? ALL_FILTER);
              setPage(1);
            },
          },
        ]}
        primaryAction={{ label: "Add coupon", onClick: openCreateForm }}
        onRefresh={() => void couponsQuery.refetch()}
        onExport={() =>
          downloadCsv(
            "coupons.csv",
            rows.map((coupon) => ({
              id: coupon.id,
              code: coupon.code,
              type: coupon.type,
              value: coupon.value,
              minOrderAmount: coupon.minOrderAmount,
              maxDiscount: coupon.maxDiscount,
              usageLimit: coupon.usageLimit,
              usedCount: coupon.usedCount,
              startDate: coupon.startDate,
              endDate: coupon.endDate,
              status: coupon.status,
            }))
          )
        }
        isLoading={couponsQuery.isPending}
        isFetching={couponsQuery.isFetching}
        error={couponsQuery.isError ? couponsQuery.error : null}
        emptyTitle="No coupons found"
        emptyDescription="Create a coupon or adjust the current search and filters."
      />

      <ResourceFormSheet
        open={formOpen}
        onOpenChange={(open) => {
          if (!isSaving) setFormOpen(open);
        }}
        title={editingCoupon ? "Edit coupon" : "Add coupon"}
        description="Set discount rules, usage limits, availability dates, and lifecycle status."
        onSubmit={handleSubmit}
        isPending={isSaving}
        submitLabel={editingCoupon ? "Save coupon" : "Create coupon"}
      >
        <CouponForm values={formValues} onChange={setFormValues} isEditing={Boolean(editingCoupon)} />
      </ResourceFormSheet>

      <DeleteResourceDialog
        open={Boolean(deleteCoupon)}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) setDeleteCoupon(null);
        }}
        resourceName={deleteCoupon?.code ?? "coupon"}
        description="Only unused coupons can be deleted. This action permanently removes the coupon."
        onConfirm={handleDelete}
        isPending={deleteMutation.isPending}
      />
    </>
  );
}
