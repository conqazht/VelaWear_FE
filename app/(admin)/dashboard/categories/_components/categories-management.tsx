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
  getApiErrorMessage,
} from "@/app/(admin)/dashboard/_components/management/resource-utils";
import { useI18n } from "@/components/providers/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  AdminCatalogStatus,
  AdminCategory,
  CreateAdminCategoryRequest,
  UpdateAdminCategoryRequest,
} from "@/lib/api/admin-commerce";
import { formatDateTime } from "@/lib/i18n/format";
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

const CATEGORY_STATUS_MESSAGE_KEYS = {
  ACTIVE: "admin.commerce.common.active",
  INACTIVE: "admin.commerce.common.inactive",
} as const;

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
  const { locale, t } = useI18n();
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
    locale,
  });
  const parentCategoriesQuery = useAdminCategoriesQuery({
    page: 1,
    size: 2000,
    sort: "sortOrder,asc",
    locale,
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
      toast.error(t("admin.commerce.categories.validation.complete"));
      return;
    }
    if (!Number.isInteger(sortOrder) || sortOrder < 0) {
      toast.error(t("admin.commerce.categories.validation.sortOrder"));
      return;
    }
    if (parentId !== null && (!Number.isInteger(parentId) || parentId <= 0)) {
      toast.error(t("admin.commerce.categories.validation.parent"));
      return;
    }
    if (parentId !== null && !parentCategories.some((category) => category.id === parentId)) {
      toast.error(t("admin.commerce.categories.validation.parentUnavailable"));
      return;
    }
    if (
      editingCategory &&
      createsCategoryCycle(parentCategories, editingCategory.id, parentId)
    ) {
      toast.error(t("admin.commerce.categories.validation.cycle"));
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
            toast.success(t("admin.commerce.categories.updated", { name }));
            setEditingCategory(null);
            setFormOpen(false);
          },
          onError: (error) => toast.error(getApiErrorMessage(error)),
        }
      );
      return;
    }

    if (!slug) {
      toast.error(t("admin.commerce.categories.validation.slugRequired"));
      return;
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      toast.error(t("admin.commerce.categories.validation.slugFormat"));
      return;
    }

    const request: CreateAdminCategoryRequest = {
      ...commonRequest,
      slug,
    };
    createMutation.mutate(request, {
      onSuccess: () => {
        toast.success(t("admin.commerce.categories.created", { name }));
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
        toast.success(t("admin.commerce.categories.archived", { name }));
        setDeleteCategory(null);
        setPage(1);
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  }

  const columns: ManagementColumn<AdminCategory>[] = [
    {
      key: "category",
      header: t("admin.commerce.categories.column.category"),
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
      header: t("admin.commerce.categories.column.parent"),
      className: "min-w-44",
      cell: (category) =>
        category.parentId === null ? (
          <Badge variant="outline">{t("admin.commerce.categories.topLevel")}</Badge>
        ) : (
          <span>
            {parentNames.get(category.parentId) ??
              t("admin.commerce.categories.categoryId", { id: category.parentId })}
          </span>
        ),
    },
    {
      key: "sortOrder",
      header: t("admin.commerce.categories.column.sortOrder"),
      className: "whitespace-nowrap tabular-nums",
      cell: (category) => category.sortOrder,
    },
    {
      key: "status",
      header: t("admin.commerce.common.status"),
      cell: (category) => (
        <Badge variant={getStatusVariant(category.status)}>
          {t(CATEGORY_STATUS_MESSAGE_KEYS[category.status])}
        </Badge>
      ),
    },
    {
      key: "updatedAt",
      header: t("admin.commerce.common.updated"),
      className: "whitespace-nowrap text-muted-foreground",
      cell: (category) => formatDateTime(category.updatedAt, locale),
    },
    {
      key: "actions",
      header: <span className="sr-only">{t("admin.commerce.common.actions")}</span>,
      headerClassName: "w-24 text-right",
      className: "text-right",
      cell: (category) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("admin.commerce.common.editNamed", { name: category.name })}
            onClick={() => openEditForm(category)}
          >
            <Pencil />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("admin.commerce.categories.archiveNamed", { name: category.name })}
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
        title={t("admin.commerce.categories.title")}
        description={t("admin.commerce.categories.description")}
        rows={rows}
        columns={columns}
        total={meta?.total ?? 0}
        page={meta?.page ?? page}
        pageSize={pageSize}
        pageCount={meta?.pages ?? 0}
        searchValue={searchValue}
        searchPlaceholder={t("admin.commerce.categories.search")}
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
              ...Object.entries(CATEGORY_STATUS_MESSAGE_KEYS).map(([value, key]) => ({
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
        primaryAction={{ label: t("admin.commerce.categories.add"), onClick: openCreateForm }}
        onRefresh={() =>
          void Promise.all([categoriesQuery.refetch(), parentCategoriesQuery.refetch()])
        }
        onExport={() =>
          downloadCsv(
            "categories.csv",
            rows.map((category) => ({
              id: category.id,
              parentId: category.parentId,
              parent:
                category.parentId === null
                  ? t("admin.commerce.categories.topLevel")
                  : parentNames.get(category.parentId),
              name: category.name,
              slug: category.originalSlug || category.slug,
              sortOrder: category.sortOrder,
              status: t(CATEGORY_STATUS_MESSAGE_KEYS[category.status]),
              createdAt: category.createdAt,
              updatedAt: category.updatedAt,
            }))
          )
        }
        isLoading={categoriesQuery.isPending}
        isFetching={categoriesQuery.isFetching || parentCategoriesQuery.isFetching}
        error={categoriesQuery.isError ? categoriesQuery.error : null}
        emptyTitle={t("admin.commerce.categories.emptyTitle")}
        emptyDescription={t("admin.commerce.categories.emptyDescription")}
      />

      <ResourceFormSheet
        open={formOpen}
        onOpenChange={(open) => {
          if (!isSaving) setFormOpen(open);
        }}
        title={
          editingCategory
            ? t("admin.commerce.categories.edit")
            : t("admin.commerce.categories.add")
        }
        description={t("admin.commerce.categories.formDescription")}
        onSubmit={handleSubmit}
        isPending={isSaving}
        submitDisabled={parentCategoriesQuery.isPending || parentCategoriesQuery.isError}
        submitLabel={
          editingCategory
            ? t("admin.commerce.categories.save")
            : t("admin.commerce.categories.create")
        }
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
        resourceName={deleteCategory?.name ?? t("admin.commerce.categories.resource")}
        actionLabel={t("admin.commerce.categories.archive")}
        description={t("admin.commerce.categories.archiveDescription")}
        onConfirm={handleDelete}
        isPending={deleteMutation.isPending}
      />
    </>
  );
}
