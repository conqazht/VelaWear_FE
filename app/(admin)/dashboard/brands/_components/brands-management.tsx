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
  formatAdminDateTime,
  getApiErrorMessage,
} from "@/app/(admin)/dashboard/_components/management/resource-utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  AdminBrand,
  AdminCatalogStatus,
  CreateAdminBrandRequest,
  UpdateAdminBrandRequest,
} from "@/lib/api/admin-commerce";
import {
  useAdminBrandsQuery,
  useCreateAdminBrandMutation,
  useDeleteAdminBrandMutation,
  useUpdateAdminBrandMutation,
} from "@/lib/queries/admin-commerce";

import { BrandForm, EMPTY_BRAND_FORM, type BrandFormValues } from "./brand-form";

const ALL_FILTER = "ALL";

const BRAND_STATUS_LABELS: Record<AdminCatalogStatus, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
};

function getStatusVariant(status: AdminCatalogStatus) {
  return status === "ACTIVE" ? ("default" as const) : ("secondary" as const);
}

function toFormValues(brand: AdminBrand): BrandFormValues {
  return {
    name: brand.name,
    slug: brand.slug,
    description: brand.description ?? "",
    status: brand.status,
  };
}

export function BrandsManagement() {
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
    sort: "updatedAt,desc",
    name: deferredSearch || undefined,
    status:
      statusFilter === ALL_FILTER ? undefined : (statusFilter as AdminCatalogStatus),
  });
  const createMutation = useCreateAdminBrandMutation();
  const updateMutation = useUpdateAdminBrandMutation();
  const deleteMutation = useDeleteAdminBrandMutation();

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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = formValues.name.trim();
    const slug = formValues.slug.trim();
    const description = formValues.description.trim() || null;

    if (!name) {
      toast.error("Enter a brand name before saving.");
      return;
    }
    if (name.length > 150) {
      toast.error("Brand names cannot exceed 150 characters.");
      return;
    }
    if (!editingBrand && !slug) {
      toast.error("Enter a brand slug before saving.");
      return;
    }
    if (!editingBrand && slug.length > 180) {
      toast.error("Brand slugs cannot exceed 180 characters.");
      return;
    }
    if (!editingBrand && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      toast.error("Use a lowercase URL-safe slug with words separated by hyphens.");
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
            toast.success(`${name} was updated.`);
            setFormOpen(false);
            setEditingBrand(null);
            setPage(1);
          },
          onError: (error) => toast.error(getApiErrorMessage(error)),
        }
      );
      return;
    }

    const request: CreateAdminBrandRequest = {
      ...commonRequest,
      slug,
    };
    createMutation.mutate(request, {
      onSuccess: () => {
        toast.success(`${name} was created.`);
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
        toast.success(`${name} was archived.`);
        setDeleteBrand(null);
        setPage(1);
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  }

  const columns: ManagementColumn<AdminBrand>[] = [
    {
      key: "brand",
      header: "Brand",
      className: "min-w-64",
      cell: (brand) => (
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Tags className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium">{brand.name}</p>
            <p className="max-w-64 truncate text-muted-foreground text-xs">/{brand.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: "description",
      header: "Description",
      className: "min-w-72",
      cell: (brand) => (
        <p className="max-w-md truncate text-muted-foreground">
          {brand.description || "No description"}
        </p>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (brand) => (
        <Badge variant={getStatusVariant(brand.status)}>
          {BRAND_STATUS_LABELS[brand.status]}
        </Badge>
      ),
    },
    {
      key: "updatedAt",
      header: "Updated",
      className: "whitespace-nowrap text-muted-foreground",
      cell: (brand) => formatAdminDateTime(brand.updatedAt),
    },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      headerClassName: "w-24 text-right",
      className: "text-right",
      cell: (brand) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Edit ${brand.name}`}
            onClick={() => openEditForm(brand)}
          >
            <Pencil />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Archive ${brand.name}`}
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
        title="Brands"
        description="Manage product brands, their catalog visibility, and public descriptions."
        rows={rows}
        columns={columns}
        total={meta?.total ?? 0}
        page={meta?.page ?? page}
        pageSize={pageSize}
        pageCount={meta?.pages ?? 0}
        searchValue={searchValue}
        searchPlaceholder="Search brand names..."
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
              ...Object.entries(BRAND_STATUS_LABELS).map(([value, label]) => ({
                value,
                label,
              })),
            ],
            onValueChange: (value) => {
              setStatusFilter(value ?? ALL_FILTER);
              setPage(1);
            },
          },
        ]}
        primaryAction={{ label: "Add brand", onClick: openCreateForm }}
        onRefresh={() => void brandsQuery.refetch()}
        onExport={() =>
          downloadCsv(
            "brands.csv",
            rows.map((brand) => ({
              id: brand.id,
              name: brand.name,
              slug: brand.slug,
              description: brand.description,
              status: brand.status,
              createdAt: brand.createdAt,
              updatedAt: brand.updatedAt,
            }))
          )
        }
        isLoading={brandsQuery.isPending}
        isFetching={brandsQuery.isFetching}
        error={brandsQuery.isError ? brandsQuery.error : null}
        emptyTitle="No brands found"
        emptyDescription="Create a brand or adjust the current search and status filter."
      />

      <ResourceFormSheet
        open={formOpen}
        onOpenChange={(open) => {
          if (!isSaving) setFormOpen(open);
        }}
        title={editingBrand ? "Edit brand" : "Add brand"}
        description="Set the catalog name, immutable slug, description, and lifecycle status."
        onSubmit={handleSubmit}
        isPending={isSaving}
        submitLabel={editingBrand ? "Save brand" : "Create brand"}
      >
        <BrandForm
          values={formValues}
          onChange={setFormValues}
          isEditing={Boolean(editingBrand)}
        />
      </ResourceFormSheet>

      <DeleteResourceDialog
        open={Boolean(deleteBrand)}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) setDeleteBrand(null);
        }}
        resourceName={deleteBrand?.name ?? "brand"}
        actionLabel="Archive"
        description="This archives the brand from active catalog lists. Existing product references are retained."
        onConfirm={handleDelete}
        isPending={deleteMutation.isPending}
      />
    </>
  );
}
