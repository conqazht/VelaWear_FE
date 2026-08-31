"use client";

import { type FormEvent, useDeferredValue, useState } from "react";
import { Archive, Pencil, Tags } from "lucide-react";
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
import {
  AdminStatusBadge,
  getStatusBadgeVariant,
} from "@/app/(admin)/dashboard/_components/admin-status-badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { getCatalogStatusToggleTarget } from "@/lib/admin-status-toggle";
import type {
  AdminBrand,
  AdminCatalogStatus,
  CreateAdminBrandRequest,
  UpdateAdminBrandRequest,
} from "@/lib/api/admin-commerce";
import { formatDateTime } from "@/lib/i18n/format";
import {
  useAdminBrandsQuery,
  useCreateAdminBrandMutation,
  useDeleteAdminBrandMutation,
  useUpdateAdminBrandMutation,
  useUpdateAdminBrandStatusMutation,
} from "@/lib/queries/admin-commerce";

import { BrandForm, EMPTY_BRAND_FORM, type BrandFormValues } from "./brand-form";

const ALL_FILTER = "ALL";

const BRAND_STATUS_MESSAGE_KEYS = {
  ACTIVE: "admin.commerce.common.active",
  INACTIVE: "admin.commerce.common.inactive",
} as const;

function toFormValues(brand: AdminBrand): BrandFormValues {
  return {
    name: brand.name,
    slug: brand.slug,
    description: brand.description ?? "",
    status: brand.status,
  };
}

export function BrandsManagement() {
  const { locale, t } = useI18n();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState(ALL_FILTER);
  const [formOpen, setFormOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<AdminBrand | null>(null);
  const [deleteBrand, setDeleteBrand] = useState<AdminBrand | null>(null);
  const [formValues, setFormValues] = useState<BrandFormValues>({ ...EMPTY_BRAND_FORM });
  const deferredSearch = useDeferredValue(searchValue.trim());

  const brandsQuery = useAdminBrandsQuery({
    page,
    size: pageSize,
    sort: "id,desc",
    name: deferredSearch || undefined,
    status: statusFilter === ALL_FILTER ? undefined : (statusFilter as AdminCatalogStatus),
  });
  const createMutation = useCreateAdminBrandMutation();
  const updateMutation = useUpdateAdminBrandMutation();
  const deleteMutation = useDeleteAdminBrandMutation();
  const statusMutation = useUpdateAdminBrandStatusMutation();

  const rows = brandsQuery.data?.result ?? [];
  const meta = brandsQuery.data?.meta;
  const isSaving = createMutation.isPending || updateMutation.isPending;

  function openCreateForm() {
    setEditingBrand(null);
    setFormValues({ ...EMPTY_BRAND_FORM });
    setFormOpen(true);
  }

  function openEditForm(brand: AdminBrand) {
    setEditingBrand(brand);
    setFormValues(toFormValues(brand));
    setFormOpen(true);
  }

  function toggleBrandStatus(brand: AdminBrand, checked: boolean) {
    statusMutation.mutate(
      { id: brand.id, status: getCatalogStatusToggleTarget(checked) },
      {
        onSuccess: () =>
          toast.success(t("admin.commerce.translation.statusUpdated", { name: brand.name })),
        onError: () =>
          toast.error(t("admin.commerce.translation.statusFailed", { name: brand.name })),
      },
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = formValues.name.trim();
    const slug = formValues.slug.trim();
    const description = formValues.description.trim() || null;

    if (!name) {
      toast.error(t("admin.commerce.brands.validation.nameRequired"));
      return;
    }
    if (name.length > 150) {
      toast.error(t("admin.commerce.brands.validation.nameLength"));
      return;
    }
    if (!editingBrand && !slug) {
      toast.error(t("admin.commerce.brands.validation.slugRequired"));
      return;
    }
    if (!editingBrand && slug.length > 180) {
      toast.error(t("admin.commerce.brands.validation.slugLength"));
      return;
    }
    if (!editingBrand && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      toast.error(t("admin.commerce.brands.validation.slugFormat"));
      return;
    }

    const commonRequest: UpdateAdminBrandRequest = {
      name,
      description,
      status: formValues.status,
    };

    if (editingBrand) {
      updateMutation.mutate(
        { id: editingBrand.id, request: commonRequest },
        {
          onSuccess: () => {
            toast.success(t("admin.commerce.brands.updated", { name }));
            setFormOpen(false);
            setEditingBrand(null);
            setPage(1);
          },
          onError: (error) => toast.error(getApiErrorMessage(error)),
        },
      );
      return;
    }

    const request: CreateAdminBrandRequest = {
      ...commonRequest,
      slug,
    };
    createMutation.mutate(request, {
      onSuccess: () => {
        toast.success(t("admin.commerce.brands.created", { name }));
        setFormOpen(false);
        setPage(1);
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  }

  function handleDelete() {
    if (!deleteBrand) return;

    const { id, name } = deleteBrand;
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success(t("admin.commerce.brands.archived", { name }));
        setDeleteBrand(null);
        setPage(1);
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  }

  const columns: ManagementColumn<AdminBrand>[] = [
    {
      key: "brand",
      header: t("admin.commerce.brands.column.brand"),
      className: "min-w-64",
      cell: (brand) => (
        <div className="flex items-center gap-3">
          <div className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
            <Tags className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium">{brand.name}</p>
            <p className="text-muted-foreground max-w-64 truncate text-xs">/{brand.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: "description",
      header: t("admin.commerce.common.description"),
      className: "min-w-72",
      cell: (brand) => (
        <p className="text-muted-foreground max-w-md truncate">
          {brand.description || t("admin.commerce.common.noDescription")}
        </p>
      ),
    },
    {
      key: "status",
      header: t("admin.commerce.common.status"),
      headerClassName: "w-48 min-w-[190px]",
      className: "w-48 min-w-[190px] whitespace-nowrap",
      cell: (brand) => (
        <div className="flex items-center gap-2">
          <Switch
            size="sm"
            checked={brand.status === "ACTIVE"}
            disabled={statusMutation.isPending}
            aria-label={t("admin.commerce.translation.toggleAria", { name: brand.name })}
            onCheckedChange={(checked) => toggleBrandStatus(brand, checked)}
          />
          <AdminStatusBadge variant={getStatusBadgeVariant(brand.status)} size="sm">
            {t(BRAND_STATUS_MESSAGE_KEYS[brand.status])}
          </AdminStatusBadge>
        </div>
      ),
    },
    {
      key: "updatedAt",
      header: t("admin.commerce.common.updated"),
      headerClassName: "w-40 min-w-[150px] whitespace-nowrap",
      className: "w-40 min-w-[150px] whitespace-nowrap text-muted-foreground",
      cell: (brand) => formatDateTime(brand.updatedAt, locale),
    },
    {
      key: "actions",
      header: <span className="sr-only">{t("admin.commerce.common.actions")}</span>,
      headerClassName: "w-24 min-w-[90px] text-right",
      className: "w-24 min-w-[90px] text-right",
      cell: (brand) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("admin.commerce.common.editNamed", { name: brand.name })}
            onClick={() => openEditForm(brand)}
          >
            <Pencil />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("admin.commerce.brands.archiveNamed", { name: brand.name })}
            onClick={() => setDeleteBrand(brand)}
          >
            <Archive />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <ResourcePage
        title={t("admin.commerce.brands.title")}
        description={t("admin.commerce.brands.description")}
        rows={rows}
        columns={columns}
        total={meta?.total ?? 0}
        page={meta?.page ?? page}
        pageSize={pageSize}
        pageCount={meta?.pages ?? 0}
        searchValue={searchValue}
        searchPlaceholder={t("admin.commerce.brands.search")}
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
              ...Object.entries(BRAND_STATUS_MESSAGE_KEYS).map(([value, key]) => ({
                value,
                label: t(key),
              })),
            ],
            onValueChange: (value) => {
              setStatusFilter(value ?? ALL_FILTER);
              setPage(1);
            },
          },
        ]}
        primaryAction={{ label: t("admin.commerce.brands.add"), onClick: openCreateForm }}
        onRefresh={() => void brandsQuery.refetch()}
        onExport={() =>
          downloadCsv(
            "brands.csv",
            rows.map((brand) => ({
              id: brand.id,
              name: brand.name,
              slug: brand.slug,
              description: brand.description,
              status: t(BRAND_STATUS_MESSAGE_KEYS[brand.status]),
              createdAt: brand.createdAt,
              updatedAt: brand.updatedAt,
            })),
          )
        }
        isLoading={brandsQuery.isPending}
        isFetching={brandsQuery.isFetching}
        error={brandsQuery.isError ? brandsQuery.error : null}
        emptyTitle={t("admin.commerce.brands.emptyTitle")}
        emptyDescription={t("admin.commerce.brands.emptyDescription")}
      />

      <ResourceFormSheet
        open={formOpen}
        onOpenChange={(open) => {
          if (!isSaving) setFormOpen(open);
        }}
        title={editingBrand ? t("admin.commerce.brands.edit") : t("admin.commerce.brands.add")}
        description={t("admin.commerce.brands.formDescription")}
        onSubmit={handleSubmit}
        isPending={isSaving}
        submitLabel={
          editingBrand ? t("admin.commerce.brands.save") : t("admin.commerce.brands.create")
        }
      >
        <BrandForm values={formValues} onChange={setFormValues} isEditing={Boolean(editingBrand)} />
      </ResourceFormSheet>

      <DeleteResourceDialog
        open={Boolean(deleteBrand)}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) setDeleteBrand(null);
        }}
        resourceName={deleteBrand?.name ?? t("admin.commerce.brands.resource")}
        actionLabel={t("admin.commerce.brands.archive")}
        description={t("admin.commerce.brands.archiveDescription")}
        onConfirm={handleDelete}
        isPending={deleteMutation.isPending}
      />
    </>
  );
}
