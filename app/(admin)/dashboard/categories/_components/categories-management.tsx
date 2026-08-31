"use client";

import { type FormEvent, useDeferredValue, useState } from "react";
import { Archive, FolderTree, Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

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
import {
  AdminStatusBadge,
  getStatusBadgeVariant,
} from "@/app/(admin)/dashboard/_components/admin-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  deleteAdminCategoryTranslation,
  getAdminCategoryTranslations,
  updateAdminCategoryTranslations,
} from "@/lib/api/admin-commerce";
import type {
  AdminCatalogStatus,
  AdminCategory,
  CategoryTranslation,
  CreateAdminCategoryRequest,
  UpdateAdminCategoryRequest,
} from "@/lib/api/admin-commerce";
import { formatDateTime } from "@/lib/i18n/format";
import {
  adminCommerceQueryKeys,
  useAdminCategoriesQuery,
  useCreateAdminCategoryMutation,
  useDeleteAdminCategoryMutation,
  useUpdateAdminCategoryMutation,
  useUpdateAdminCategoryStatusMutation,
} from "@/lib/queries/admin-commerce";
import type { Locale } from "@/lib/i18n";
import type { GeminiContentModel } from "@/lib/api/admin-translation-suggestions";
import { getCatalogStatusToggleTarget } from "@/lib/admin-status-toggle";
import { invalidatePublicQueries } from "@/lib/queries/public-cache";
import { useCategoryEnglishSuggestionMutation } from "@/lib/queries/admin-translation-suggestions";
import { toAsciiUrlSlug } from "@/lib/url-slug";

import {
  CategoryForm,
  EMPTY_CATEGORY_FORM,
  EMPTY_CATEGORY_TRANSLATION,
  isCategoryTranslationComplete,
  isCategoryTranslationEmpty,
  serializeCategoryTranslation,
  type CategoryFormValues,
  type CategoryTranslationFormValue,
} from "./category-form";

const ALL_FILTER = "ALL";

const CATEGORY_STATUS_MESSAGE_KEYS = {
  ACTIVE: "admin.commerce.common.active",
  INACTIVE: "admin.commerce.common.inactive",
} as const;

function toTranslationFormValue(translation?: CategoryTranslation): CategoryTranslationFormValue {
  return translation
    ? {
        name: translation.name,
        slug: translation.slug,
        description: translation.description ?? "",
        seoTitle: translation.seoTitle ?? "",
        seoDescription: translation.seoDescription ?? "",
      }
    : { ...EMPTY_CATEGORY_TRANSLATION };
}

function toFormValues(
  category: AdminCategory,
  translations: CategoryTranslation[],
): CategoryFormValues {
  const byLocale = new Map(
    translations.map((translation) => [translation.localeCode, translation]),
  );
  const vi = toTranslationFormValue(byLocale.get("vi"));
  if (!byLocale.has("vi")) {
    vi.name = category.name;
    vi.slug = category.originalSlug || category.slug;
    vi.description = category.description ?? "";
    vi.seoTitle = category.seoTitle ?? "";
    vi.seoDescription = category.seoDescription ?? "";
  }
  return {
    parentId: category.parentId === null ? "" : String(category.parentId),
    sortOrder: String(category.sortOrder),
    status: category.status,
    translations: { vi, en: toTranslationFormValue(byLocale.get("en")) },
  };
}

function createsCategoryCycle(
  categories: AdminCategory[],
  categoryId: number,
  parentId: number | null,
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
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState(ALL_FILTER);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<AdminCategory | null>(null);
  const [formValues, setFormValues] = useState<CategoryFormValues>({ ...EMPTY_CATEGORY_FORM });
  const [contentLocale, setContentLocale] = useState<Locale>("vi");
  const [loadingCategoryId, setLoadingCategoryId] = useState<number | null>(null);
  const [isContentSaving, setIsContentSaving] = useState(false);
  const deferredSearch = useDeferredValue(searchValue.trim());

  const categoriesQuery = useAdminCategoriesQuery({
    page,
    size: pageSize,
    sort: "id,desc",
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
  const statusMutation = useUpdateAdminCategoryStatusMutation();
  const englishSuggestionMutation = useCategoryEnglishSuggestionMutation();

  const rows = categoriesQuery.data?.result ?? [];
  const meta = categoriesQuery.data?.meta;
  const parentCategories = parentCategoriesQuery.data?.result ?? [];
  const parentNames = new Map(parentCategories.map((category) => [category.id, category.name]));
  const isSaving =
    createMutation.isPending ||
    updateMutation.isPending ||
    isContentSaving ||
    englishSuggestionMutation.isPending;

  function openCreateForm() {
    setEditingCategory(null);
    setFormValues({
      ...EMPTY_CATEGORY_FORM,
      translations: {
        vi: { ...EMPTY_CATEGORY_TRANSLATION },
        en: { ...EMPTY_CATEGORY_TRANSLATION },
      },
    });
    setContentLocale("vi");
    setFormOpen(true);
  }

  async function openEditForm(category: AdminCategory) {
    setLoadingCategoryId(category.id);
    try {
      const { translations } = await getAdminCategoryTranslations(category.id);
      setEditingCategory(category);
      setFormValues(toFormValues(category, translations));
      setContentLocale("vi");
      setFormOpen(true);
    } catch (error) {
      toast.error(`${t("admin.commerce.translation.loadFailed")} ${getApiErrorMessage(error)}`);
    } finally {
      setLoadingCategoryId(null);
    }
  }

  async function generateEnglishContent(model: GeminiContentModel) {
    const source = formValues.translations.vi;
    const nullable = (value: string) => value.trim() || null;

    try {
      const suggestion = await englishSuggestionMutation.mutateAsync({
        model,
        name: source.name.trim(),
        description: nullable(source.description),
        seoTitle: nullable(source.seoTitle),
        seoDescription: nullable(source.seoDescription),
      });
      const name = suggestion.name.trim();
      const slug = toAsciiUrlSlug(name);
      if (suggestion.localeCode !== "en" || !name || !slug) {
        toast.error(t("admin.contentGeneration.invalidResponse"));
        return;
      }

      setFormValues((current) => ({
        ...current,
        translations: {
          ...current.translations,
          en: {
            name,
            slug,
            description: suggestion.description ?? "",
            seoTitle: suggestion.seoTitle ?? "",
            seoDescription: suggestion.seoDescription ?? "",
          },
        },
      }));
      setContentLocale("en");
      toast.success(t("admin.contentGeneration.success"));
    } catch (error) {
      toast.error(`${t("admin.contentGeneration.failed")} ${getApiErrorMessage(error)}`);
    }
  }

  async function saveCategory() {
    const viTranslation = formValues.translations.vi;
    const enTranslation = formValues.translations.en;
    const name = viTranslation.name.trim();
    const slug = viTranslation.slug.trim();
    const sortOrder = Number(formValues.sortOrder);
    const parentId = formValues.parentId === "" ? null : Number(formValues.parentId);

    if (!isCategoryTranslationComplete(viTranslation) || formValues.sortOrder.trim() === "") {
      setContentLocale("vi");
      toast.error(t("admin.commerce.categories.validation.complete"));
      return;
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      setContentLocale("vi");
      toast.error(t("admin.commerce.categories.validation.slugFormat"));
      return;
    }
    if (!isCategoryTranslationEmpty(enTranslation)) {
      if (!isCategoryTranslationComplete(enTranslation)) {
        setContentLocale("en");
        toast.error(t("admin.commerce.translation.enPartial"));
        return;
      }
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(enTranslation.slug.trim())) {
        setContentLocale("en");
        toast.error(t("admin.commerce.categories.validation.slugFormat"));
        return;
      }
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
    if (editingCategory && createsCategoryCycle(parentCategories, editingCategory.id, parentId)) {
      toast.error(t("admin.commerce.categories.validation.cycle"));
      return;
    }

    const commonRequest: UpdateAdminCategoryRequest = {
      parentId,
      name,
      sortOrder,
      status: formValues.status,
    };

    setIsContentSaving(true);
    try {
      const category = editingCategory
        ? await updateMutation.mutateAsync({ id: editingCategory.id, request: commonRequest })
        : await createMutation.mutateAsync({
            ...commonRequest,
            slug,
          } satisfies CreateAdminCategoryRequest);
      if (!editingCategory) {
        setEditingCategory(category);
      }
      const translations: CategoryTranslation[] = [
        serializeCategoryTranslation("vi", viTranslation),
      ];
      if (!isCategoryTranslationEmpty(enTranslation)) {
        translations.push(serializeCategoryTranslation("en", enTranslation));
      }
      const translationResponse = await updateAdminCategoryTranslations(category.id, {
        translations,
      });
      const savedTranslations = translationResponse.translations;
      if (
        isCategoryTranslationEmpty(enTranslation) &&
        savedTranslations.some((translation) => translation.localeCode === "en")
      ) {
        await deleteAdminCategoryTranslation(category.id, "en");
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminCommerceQueryKeys.categories.root }),
        invalidatePublicQueries(queryClient, ["categories", "productLists", "productDetails"]),
        queryClient.invalidateQueries({
          queryKey: adminCommerceQueryKeys.categories.translations(category.id),
        }),
      ]);
      toast.success(
        t(
          editingCategory
            ? "admin.commerce.categories.updated"
            : "admin.commerce.categories.created",
          { name },
        ),
      );
      setEditingCategory(null);
      setPage(1);
      setFormOpen(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsContentSaving(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void saveCategory();
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

  function toggleCategoryStatus(category: AdminCategory, checked: boolean) {
    statusMutation.mutate(
      { id: category.id, status: getCatalogStatusToggleTarget(checked) },
      {
        onSuccess: () =>
          toast.success(t("admin.commerce.translation.statusUpdated", { name: category.name })),
        onError: () =>
          toast.error(t("admin.commerce.translation.statusFailed", { name: category.name })),
      },
    );
  }

  const columns: ManagementColumn<AdminCategory>[] = [
    {
      key: "category",
      header: t("admin.commerce.categories.column.category"),
      className: "min-w-64",
      cell: (category) => (
        <div className="flex items-center gap-3">
          <div className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
            <FolderTree className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium">{category.name}</p>
            <p className="text-muted-foreground max-w-60 truncate text-xs">
              /{category.originalSlug || category.slug}
            </p>
            <div className="mt-1 flex gap-1">
              {(["vi", "en"] as const).map((translationLocale) => (
                <Badge
                  key={translationLocale}
                  variant={
                    category.translationLocales?.includes(translationLocale)
                      ? "secondary"
                      : "outline"
                  }
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
      key: "parent",
      header: t("admin.commerce.categories.column.parent"),
      headerClassName: "w-44 min-w-[160px]",
      className: "w-44 min-w-[160px]",
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
      headerClassName: "w-24 min-w-[90px] whitespace-nowrap",
      className: "w-24 min-w-[90px] whitespace-nowrap tabular-nums",
      cell: (category) => category.sortOrder,
    },
    {
      key: "status",
      header: t("admin.commerce.common.status"),
      headerClassName: "w-48 min-w-[190px]",
      className: "w-48 min-w-[190px] whitespace-nowrap",
      cell: (category) => (
        <div className="flex items-center gap-2">
          <Switch
            size="sm"
            checked={category.status === "ACTIVE"}
            disabled={statusMutation.isPending}
            aria-label={t("admin.commerce.translation.toggleAria", { name: category.name })}
            onCheckedChange={(checked) => toggleCategoryStatus(category, checked)}
          />
          <AdminStatusBadge variant={getStatusBadgeVariant(category.status)} size="sm">
            {t(CATEGORY_STATUS_MESSAGE_KEYS[category.status])}
          </AdminStatusBadge>
        </div>
      ),
    },
    {
      key: "updatedAt",
      header: t("admin.commerce.common.updated"),
      headerClassName: "w-40 min-w-[150px] whitespace-nowrap",
      className: "w-40 min-w-[150px] whitespace-nowrap text-muted-foreground",
      cell: (category) => formatDateTime(category.updatedAt, locale),
    },
    {
      key: "actions",
      header: <span className="sr-only">{t("admin.commerce.common.actions")}</span>,
      headerClassName: "w-24 min-w-[90px] text-right",
      className: "w-24 min-w-[90px] text-right",
      cell: (category) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("admin.commerce.common.editNamed", { name: category.name })}
            disabled={loadingCategoryId !== null}
            onClick={() => void openEditForm(category)}
          >
            {loadingCategoryId === category.id ? <Loader2 className="animate-spin" /> : <Pencil />}
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
            })),
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
          editingCategory ? t("admin.commerce.categories.edit") : t("admin.commerce.categories.add")
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
          contentLocale={contentLocale}
          onContentLocaleChange={setContentLocale}
          categories={parentCategories}
          editingCategoryId={editingCategory?.id ?? null}
          isCatalogLoading={parentCategoriesQuery.isPending}
          catalogError={
            parentCategoriesQuery.isError ? getApiErrorMessage(parentCategoriesQuery.error) : null
          }
          isGeneratingEnglish={englishSuggestionMutation.isPending}
          onGenerateEnglish={generateEnglishContent}
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
