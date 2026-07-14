"use client";

import { type FormEvent, useDeferredValue, useState } from "react";
import { Archive, FolderTree, Pencil } from "lucide-react";
import { toast } from "sonner";

import {
  DeleteResourceDialog,
  ResourceFormSheet,
} from "@/app/(admin)/dashboard/_components/management/resource-overlays";
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
import type {
  AdminCatalogStatus,
  AdminCategory,
  CreateAdminCategoryRequest,
  UpdateAdminCategoryRequest,
} from "@/lib/api/admin-commerce";
import {
  useAdminCategoriesQuery,
  useCreateAdminCategoryMutation,
  useDeleteAdminCategoryMutation,
  useUpdateAdminCategoryMutation,
} from "@/lib/queries/admin-commerce";

import {
  CategoryForm,
  EMPTY_CATEGORY_FORM,
  type CategoryFormValues,
} from "./category-form";

const ALL_FILTER = "ALL";
const ADMIN_LOCALE = "vi";

const CATEGORY_STATUS_LABELS: Record<AdminCatalogStatus, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
};

function getStatusVariant(status: AdminCatalogStatus) {
  return status === "ACTIVE" ? ("default" as const) : ("secondary" as const);
}

function toFormValues(category: AdminCategory): CategoryFormValues {
  return {
    parentId: category.parentId === null ? "" : String(category.parentId),
    name: category.name,
    slug: category.originalSlug || category.slug,
    sortOrder: String(category.sortOrder),
    status: category.status,
  };
}

function createsCategoryCycle(
  categories: AdminCategory[],
  categoryId: number,
  parentId: number | null
) {
  const parents = new Map(categories.map((category) => [category.id, category.parentId]));
  const visited = new Set<number>();
  let currentId = parentId;

  while (currentId !== null && !visited.has(currentId)) {
    if (currentId === categoryId) return true;
    visited.add(currentId);
    currentId = parents.get(currentId) ?? null;
  }

  return false;
}

export function CategoriesManagement() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState(ALL_FILTER);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<AdminCategory | null>(null);
  const [formValues, setFormValues] = useState<CategoryFormValues>({ ...EMPTY_CATEGORY_FORM });
  const deferredSearch = useDeferredValue(searchValue.trim());

  const categoriesQuery = useAdminCategoriesQuery({
    page,
    size: pageSize,
    sort: "sortOrder,asc",
    name: deferredSearch || undefined,
    status: statusFilter === ALL_FILTER ? undefined : (statusFilter as AdminCatalogStatus),
    locale: ADMIN_LOCALE,
  });
  const parentCategoriesQuery = useAdminCategoriesQuery({
    page: 1,
    size: 2000,
    sort: "sortOrder,asc",
    locale: ADMIN_LOCALE,
  });
  const createMutation = useCreateAdminCategoryMutation();
  const updateMutation = useUpdateAdminCategoryMutation();
  const deleteMutation = useDeleteAdminCategoryMutation();

  const rows = categoriesQuery.data?.result ?? [];
  const meta = categoriesQuery.data?.meta;
  const parentCategories = parentCategoriesQuery.data?.result ?? [];
  const parentNames = new Map(parentCategories.map((category) => [category.id, category.name]));
  const isSaving = createMutation.isPending || updateMutation.isPending;

  function openCreateForm() {
    setEditingCategory(null);
    setFormValues({ ...EMPTY_CATEGORY_FORM });
    setFormOpen(true);
  }

  function openEditForm(category: AdminCategory) {
    setEditingCategory(category);
    setFormValues(toFormValues(category));
    setFormOpen(true);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = formValues.name.trim();
    const slug = formValues.slug.trim();
    const sortOrder = Number(formValues.sortOrder);
    const parentId = formValues.parentId === "" ? null : Number(formValues.parentId);

    if (!name || formValues.sortOrder.trim() === "") {
      toast.error("Complete the category name and sort order before saving.");
      return;
    }
    if (!Number.isInteger(sortOrder) || sortOrder < 0) {
      toast.error("Sort order must be a non-negative whole number.");
      return;
    }
    if (parentId !== null && (!Number.isInteger(parentId) || parentId <= 0)) {
      toast.error("Choose a valid parent category.");
      return;
    }
    if (parentId !== null && !parentCategories.some((category) => category.id === parentId)) {
      toast.error("The selected parent category is no longer available.");
      return;
    }
    if (
      editingCategory &&
      createsCategoryCycle(parentCategories, editingCategory.id, parentId)
    ) {
      toast.error("Choose a parent outside this category's own hierarchy.");
      return;
    }

    const commonRequest: UpdateAdminCategoryRequest = {
      parentId,
      name,
      sortOrder,
      status: formValues.status,
    };

    if (editingCategory) {
      updateMutation.mutate(
        { id: editingCategory.id, request: commonRequest },
        {
          onSuccess: () => {
            toast.success(`${name} was updated.`);
            setEditingCategory(null);
            setFormOpen(false);
          },
          onError: (error) => toast.error(getApiErrorMessage(error)),
        }
      );
      return;
    }

    if (!slug) {
      toast.error("Enter a slug before creating the category.");
      return;
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      toast.error("Use a lowercase URL-safe slug with words separated by hyphens.");
      return;
    }

    const request: CreateAdminCategoryRequest = {
      ...commonRequest,
      slug,
    };
    createMutation.mutate(request, {
      onSuccess: () => {
        toast.success(`${name} was created.`);
        setPage(1);
        setFormOpen(false);
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  }

  function handleDelete() {
    if (!deleteCategory) return;

    const { id, name } = deleteCategory;
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success(`${name} was archived.`);
        setDeleteCategory(null);
        setPage(1);
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  }

  const columns: ManagementColumn<AdminCategory>[] = [
    {
      key: "category",
      header: "Category",
      className: "min-w-64",
      cell: (category) => (
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <FolderTree className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium">{category.name}</p>
            <p className="max-w-60 truncate text-muted-foreground text-xs">
              /{category.originalSlug || category.slug}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "parent",
      header: "Parent",
      className: "min-w-44",
      cell: (category) =>
        category.parentId === null ? (
          <Badge variant="outline">Top level</Badge>
        ) : (
          <span>{parentNames.get(category.parentId) ?? `Category #${category.parentId}`}</span>
        ),
    },
    {
      key: "sortOrder",
      header: "Sort order",
      className: "whitespace-nowrap tabular-nums",
      cell: (category) => category.sortOrder,
    },
    {
      key: "status",
      header: "Status",
      cell: (category) => (
        <Badge variant={getStatusVariant(category.status)}>
          {CATEGORY_STATUS_LABELS[category.status]}
        </Badge>
      ),
    },
    {
      key: "updatedAt",
      header: "Updated",
      className: "whitespace-nowrap text-muted-foreground",
      cell: (category) => formatAdminDateTime(category.updatedAt),
    },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      headerClassName: "w-24 text-right",
      className: "text-right",
      cell: (category) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Edit ${category.name}`}
            onClick={() => openEditForm(category)}
          >
            <Pencil />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Archive ${category.name}`}
            onClick={() => setDeleteCategory(category)}
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
        title="Categories"
        description="Manage the Vietnamese catalog hierarchy, storefront visibility, and display order."
        rows={rows}
        columns={columns}
        total={meta?.total ?? 0}
        page={meta?.page ?? page}
        pageSize={pageSize}
        pageCount={meta?.pages ?? 0}
        searchValue={searchValue}
        searchPlaceholder="Search category names..."
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
              ...Object.entries(CATEGORY_STATUS_LABELS).map(([value, label]) => ({ value, label })),
            ],
            onValueChange: (value) => {
              setStatusFilter(value ?? ALL_FILTER);
              setPage(1);
            },
          },
        ]}
        primaryAction={{ label: "Add category", onClick: openCreateForm }}
        onRefresh={() =>
          void Promise.all([categoriesQuery.refetch(), parentCategoriesQuery.refetch()])
        }
        onExport={() =>
          downloadCsv(
            "categories.csv",
            rows.map((category) => ({
              id: category.id,
              parentId: category.parentId,
              parent: category.parentId === null ? "Top level" : parentNames.get(category.parentId),
              name: category.name,
              slug: category.originalSlug || category.slug,
              sortOrder: category.sortOrder,
              status: category.status,
              createdAt: category.createdAt,
              updatedAt: category.updatedAt,
            }))
          )
        }
        isLoading={categoriesQuery.isPending}
        isFetching={categoriesQuery.isFetching || parentCategoriesQuery.isFetching}
        error={categoriesQuery.isError ? getApiErrorMessage(categoriesQuery.error) : null}
        emptyTitle="No categories found"
        emptyDescription="Add a category or adjust the current name and status filters."
      />

      <ResourceFormSheet
        open={formOpen}
        onOpenChange={(open) => {
          if (!isSaving) setFormOpen(open);
        }}
        title={editingCategory ? "Edit category" : "Add category"}
        description="Configure the Vietnamese category name, hierarchy, display order, and catalog status."
        onSubmit={handleSubmit}
        isPending={isSaving}
        submitDisabled={parentCategoriesQuery.isPending || parentCategoriesQuery.isError}
        submitLabel={editingCategory ? "Save category" : "Create category"}
      >
        <CategoryForm
          values={formValues}
          onChange={setFormValues}
          categories={parentCategories}
          editingCategoryId={editingCategory?.id ?? null}
          isCatalogLoading={parentCategoriesQuery.isPending}
          catalogError={
            parentCategoriesQuery.isError
              ? getApiErrorMessage(parentCategoriesQuery.error)
              : null
          }
        />
      </ResourceFormSheet>

      <DeleteResourceDialog
        open={Boolean(deleteCategory)}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) setDeleteCategory(null);
        }}
        resourceName={deleteCategory?.name ?? "category"}
        actionLabel="Archive"
        description="Archiving hides this category from catalog lists. Existing child categories and products may continue to reference it."
        onConfirm={handleDelete}
        isPending={deleteMutation.isPending}
      />
    </>
  );
}
