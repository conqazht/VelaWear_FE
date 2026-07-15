"use client";

import { type FormEvent, useDeferredValue, useRef, useState } from "react";
import { Archive, Loader2, Package, Pencil } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

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
  resolveAdminAssetUrl,
} from "@/app/(admin)/dashboard/_components/management/resource-utils";
import { useI18n } from "@/components/providers/i18n-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  createAdminProduct,
  createAdminProductVariant,
  deleteAdminProductTranslation,
  deleteAdminProductVariant,
  getAdminProductVariant,
  getAdminProductVariants,
  getAdminProductTranslations,
  updateAdminProduct,
  updateAdminProductTranslations,
  updateAdminProductVariant,
} from "@/lib/api/admin-commerce";
import { formatCurrency, formatDateTime } from "@/lib/i18n/format";
import type {
  AdminCatalogOption,
  AdminProduct,
  AdminProductVariant,
  ProductTranslation,
  CreateAdminProductRequest,
  CreateAdminProductVariantRequest,
  ProductStatus,
  UpdateAdminProductRequest,
  UpdateAdminProductVariantRequest,
} from "@/lib/api/admin-commerce";
import {
  useAdminBrandsQuery,
  useAdminCategoriesQuery,
  useAdminColorsQuery,
  useAdminProductsQuery,
  useAdminSizesQuery,
  adminCommerceQueryKeys,
  useDeleteAdminProductMutation,
  useUpdateAdminProductStatusMutation,
  useUpdateAdminProductVariantStatusMutation,
} from "@/lib/queries/admin-commerce";
import type { Locale } from "@/lib/i18n";
import type { GeminiContentModel } from "@/lib/api/admin-translation-suggestions";
import { invalidatePublicQueries } from "@/lib/queries/public-cache";
import { useProductEnglishSuggestionMutation } from "@/lib/queries/admin-translation-suggestions";
import { toAsciiUrlSlug } from "@/lib/url-slug";
import {
  getProductStatusToggleState,
  getProductStatusToggleTarget,
} from "@/lib/admin-status-toggle";

import {
  EMPTY_PRODUCT_FORM,
  EMPTY_PRODUCT_TRANSLATION,
  isProductTranslationComplete,
  isProductTranslationEmpty,
  ProductForm,
  serializeProductTranslation,
  type ProductFormValues,
  type ProductTranslationFormValue,
} from "./product-form";
import {
  createEmptyProductVariant,
  ProductVariantsForm,
  type ProductVariantFormValue,
} from "./product-variants-form";
import {
  createProductVariantWorkflowCheckpoint,
  recordDeletedVariant,
  recordPersistedVariant,
  type ProductVariantWorkflowCheckpoint,
} from "../_data/product-variant-workflow";

const ALL_FILTER = "ALL";

const PRODUCT_STATUS_MESSAGE_KEYS = {
  DRAFT: "admin.commerce.products.status.draft",
  ACTIVE: "admin.commerce.products.status.active",
  INACTIVE: "admin.commerce.products.status.inactive",
  OUT_OF_STOCK: "admin.commerce.products.status.outOfStock",
} as const;

const PRODUCT_STATUSES: ProductStatus[] = ["DRAFT", "ACTIVE", "INACTIVE", "OUT_OF_STOCK"];

function getStatusVariant(status: ProductStatus) {
  if (status === "ACTIVE") return "default" as const;
  if (status === "INACTIVE") return "destructive" as const;
  if (status === "DRAFT") return "secondary" as const;
  return "outline" as const;
}

function toTranslationFormValue(
  translation?: ProductTranslation,
): ProductTranslationFormValue {
  return translation
    ? {
        name: translation.name,
        slug: translation.slug,
        shortDescription: translation.shortDescription ?? "",
        description: translation.description ?? "",
        material: translation.material ?? "",
        careInstruction: translation.careInstruction ?? "",
        seoTitle: translation.seoTitle ?? "",
        seoDescription: translation.seoDescription ?? "",
      }
    : { ...EMPTY_PRODUCT_TRANSLATION };
}

function toFormValues(
  product: AdminProduct,
  translations: ProductTranslation[],
): ProductFormValues {
  const byLocale = new Map(translations.map((translation) => [translation.localeCode, translation]));
  const vi = toTranslationFormValue(byLocale.get("vi"));
  if (!byLocale.has("vi")) {
    vi.name = product.name;
    vi.slug = product.originalSlug || product.slug;
    vi.description = product.description ?? "";
    vi.shortDescription = product.shortDescription ?? "";
    vi.material = product.material ?? "";
    vi.careInstruction = product.careInstruction ?? "";
    vi.seoTitle = product.seoTitle ?? "";
    vi.seoDescription = product.seoDescription ?? "";
  }
  return {
    categoryId: String(product.categoryId),
    brandId: String(product.brandId),
    status: product.status,
    translations: {
      vi,
      en: toTranslationFormValue(byLocale.get("en")),
    },
  };
}

function toVariantFormValue(variant: AdminProductVariant): ProductVariantFormValue {
  return {
    key: `variant-${variant.id}`,
    id: variant.id,
    sku: variant.sku,
    price: String(variant.price),
    stockQuantity: String(variant.stockQuantity),
    colorId: variant.color ? String(variant.color.id) : "",
    sizeId: variant.size ? String(variant.size.id) : "",
    status: variant.status,
  };
}

function toVariantRequest(
  productId: number,
  variant: ProductVariantFormValue
): CreateAdminProductVariantRequest {
  return {
    productId,
    sku: variant.sku.trim(),
    price: Number(variant.price),
    stockQuantity: Number(variant.stockQuantity),
    colorId: variant.colorId ? Number(variant.colorId) : null,
    sizeId: variant.sizeId ? Number(variant.sizeId) : null,
    status: variant.status,
  };
}

function getVariantValidationError(
  variants: ProductVariantFormValue[],
  t: ReturnType<typeof useI18n>["t"]
) {
  if (variants.length === 0) return t("admin.commerce.products.validation.addVariant");

  const skus = new Set<string>();
  const combinations = new Set<string>();

  for (const [index, variant] of variants.entries()) {
    const number = index + 1;
    const sku = variant.sku.trim();
    const price = Number(variant.price);
    const stock = Number(variant.stockQuantity);

    if (!sku) return t("admin.commerce.products.validation.skuRequired", { number });
    if (skus.has(sku.toLowerCase())) {
      return t("admin.commerce.products.validation.duplicateSku", { sku });
    }
    skus.add(sku.toLowerCase());

    if (variant.price.trim() === "" || !Number.isFinite(price) || price < 0) {
      return t("admin.commerce.products.validation.price", { number });
    }
    if (variant.stockQuantity.trim() === "" || !Number.isInteger(stock) || stock < 0) {
      return t("admin.commerce.products.validation.stock", { number });
    }
    if (stock === 0 && variant.status === "ACTIVE") {
      return t("admin.commerce.products.validation.zeroStockActive", { number });
    }
    if (stock > 0 && variant.status === "OUT_OF_STOCK") {
      return t("admin.commerce.products.validation.stockAvailable", { number });
    }

    const combination = `${variant.colorId || "none"}:${variant.sizeId || "none"}`;
    if (combinations.has(combination)) {
      return t("admin.commerce.products.validation.duplicateOptions", { number });
    }
    combinations.add(combination);
  }

  return null;
}

function variantRequestsEqual(
  left: CreateAdminProductVariantRequest,
  right: CreateAdminProductVariantRequest
) {
  return (
    left.productId === right.productId &&
    left.sku === right.sku &&
    left.price === right.price &&
    left.stockQuantity === right.stockQuantity &&
    left.colorId === right.colorId &&
    left.sizeId === right.sizeId &&
    left.status === right.status
  );
}

function productRequestChanged(product: AdminProduct, request: UpdateAdminProductRequest) {
  return (
    product.categoryId !== request.categoryId ||
    product.brandId !== request.brandId ||
    product.name !== request.name ||
    (product.description ?? null) !== request.description ||
    product.status !== request.status
  );
}

function mergeVariantRequest(
  productId: number,
  desired: ProductVariantFormValue,
  baseline: ProductVariantFormValue,
  current: AdminProductVariant
): UpdateAdminProductVariantRequest {
  const desiredRequest = toVariantRequest(productId, desired);
  const baselineRequest = toVariantRequest(productId, baseline);
  const currentRequest = toVariantRequest(productId, toVariantFormValue(current));

  return {
    productId,
    sku: desiredRequest.sku !== baselineRequest.sku ? desiredRequest.sku : currentRequest.sku,
    price: desiredRequest.price !== baselineRequest.price ? desiredRequest.price : currentRequest.price,
    stockQuantity:
      desiredRequest.stockQuantity !== baselineRequest.stockQuantity
        ? desiredRequest.stockQuantity
        : currentRequest.stockQuantity,
    colorId:
      desiredRequest.colorId !== baselineRequest.colorId
        ? desiredRequest.colorId
        : currentRequest.colorId,
    sizeId:
      desiredRequest.sizeId !== baselineRequest.sizeId
        ? desiredRequest.sizeId
        : currentRequest.sizeId,
    status:
      desiredRequest.status !== baselineRequest.status
        ? desired.status
        : current.status,
  };
}

export function ProductsManagement() {
  const { locale, t } = useI18n();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState(ALL_FILTER);
  const [categoryFilter, setCategoryFilter] = useState(ALL_FILTER);
  const [brandFilter, setBrandFilter] = useState(ALL_FILTER);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [archiveProduct, setArchiveProduct] = useState<AdminProduct | null>(null);
  const [formValues, setFormValues] = useState<ProductFormValues>({ ...EMPTY_PRODUCT_FORM });
  const [contentLocale, setContentLocale] = useState<Locale>("vi");
  const [variantValues, setVariantValues] = useState<ProductVariantFormValue[]>([
    createEmptyProductVariant("new-0"),
  ]);
  const [knownVariantIds, setKnownVariantIds] = useState<number[]>([]);
  const [baselineVariantValues, setBaselineVariantValues] = useState<ProductVariantFormValue[]>([]);
  const variantWorkflowCheckpointRef = useRef<ProductVariantWorkflowCheckpoint | null>(null);
  const [loadingVariantProductId, setLoadingVariantProductId] = useState<number | null>(null);
  const [isWorkflowSaving, setIsWorkflowSaving] = useState(false);
  const [isArchiveWorkflowPending, setIsArchiveWorkflowPending] = useState(false);
  const [formTab, setFormTab] = useState("details");
  const deferredSearch = useDeferredValue(searchValue.trim());

  const productsQuery = useAdminProductsQuery({
    page,
    size: pageSize,
    sort: "updatedAt,desc",
    name: deferredSearch || undefined,
    global: true,
    status: statusFilter === ALL_FILTER ? undefined : (statusFilter as ProductStatus),
    categoryId: categoryFilter === ALL_FILTER ? undefined : Number(categoryFilter),
    brandId: brandFilter === ALL_FILTER ? undefined : Number(brandFilter),
    locale,
  });
  const categoriesQuery = useAdminCategoriesQuery({ locale });
  const brandsQuery = useAdminBrandsQuery();
  const colorsQuery = useAdminColorsQuery({ page: 1, size: 2000, sort: "sortOrder,asc" });
  const sizesQuery = useAdminSizesQuery({ page: 1, size: 2000, sort: "sortOrder,asc" });
  const deleteMutation = useDeleteAdminProductMutation();
  const statusMutation = useUpdateAdminProductStatusMutation();
  const variantStatusMutation = useUpdateAdminProductVariantStatusMutation();
  const englishSuggestionMutation = useProductEnglishSuggestionMutation();

  const rows = productsQuery.data?.result ?? [];
  const meta = productsQuery.data?.meta;
  const categories = categoriesQuery.data?.result ?? [];
  const brands = brandsQuery.data?.result ?? [];
  const colors = colorsQuery.data?.result ?? [];
  const sizes = sizesQuery.data?.result ?? [];
  const productCategoryOptions: AdminCatalogOption[] = [...categories];
  const productBrandOptions: AdminCatalogOption[] = [...brands];
  if (
    editingProduct &&
    !productCategoryOptions.some((category) => category.id === editingProduct.categoryId)
  ) {
    productCategoryOptions.push({
      id: editingProduct.categoryId,
      name:
        editingProduct.categoryName ??
        t("admin.commerce.products.archivedCategory", { id: editingProduct.categoryId }),
    });
  }
  if (
    editingProduct &&
    !productBrandOptions.some((brand) => brand.id === editingProduct.brandId)
  ) {
    productBrandOptions.push({
      id: editingProduct.brandId,
      name: t("admin.commerce.products.archivedBrand", { id: editingProduct.brandId }),
    });
  }
  const brandNames = new Map(brands.map((brand) => [brand.id, brand.name]));
  const isSaving = isWorkflowSaving || englishSuggestionMutation.isPending;

  function openCreateForm() {
    variantWorkflowCheckpointRef.current = null;
    setEditingProduct(null);
    setFormValues({
      ...EMPTY_PRODUCT_FORM,
      translations: {
        vi: { ...EMPTY_PRODUCT_TRANSLATION },
        en: { ...EMPTY_PRODUCT_TRANSLATION },
      },
    });
    setContentLocale("vi");
    setVariantValues([createEmptyProductVariant(`new-${Date.now()}`)]);
    setKnownVariantIds([]);
    setBaselineVariantValues([]);
    setFormTab("details");
    setFormOpen(true);
  }

  async function openEditForm(product: AdminProduct) {
    variantWorkflowCheckpointRef.current = null;
    setLoadingVariantProductId(product.id);
    try {
      const [variantsPage, translationsResponse] = await Promise.all([
        getAdminProductVariants({
          productId: product.id,
          page: 1,
          size: 2000,
          sort: "id,asc",
        }),
        getAdminProductTranslations(product.id),
      ]);
      const loadedVariants = variantsPage.result.map(toVariantFormValue);
      const translations = translationsResponse.translations;

      setEditingProduct(product);
      setFormValues(toFormValues(product, translations));
      setContentLocale("vi");
      setVariantValues(
        loadedVariants.length > 0
          ? loadedVariants
          : [createEmptyProductVariant(`new-${Date.now()}`)]
      );
      setKnownVariantIds(variantsPage.result.map((variant) => variant.id));
      setBaselineVariantValues(loadedVariants);
      setFormTab("details");
      setFormOpen(true);
    } catch (error) {
      toast.error(
        `${t("admin.commerce.translation.loadFailed")} ${getApiErrorMessage(error)}`
      );
    } finally {
      setLoadingVariantProductId(null);
    }
  }

  async function persistVariants(
    productId: number,
    initialCheckpoint: ProductVariantWorkflowCheckpoint,
  ) {
    let checkpoint = initialCheckpoint;

    for (let index = 0; index < checkpoint.workingVariants.length; index += 1) {
      const variant = checkpoint.workingVariants[index];
      const request = toVariantRequest(productId, variant);
      let savedVariant: AdminProductVariant;

      if (variant.id !== undefined) {
        const baseline = checkpoint.persistedBaselines.find(
          (item) => item.id === variant.id,
        );
        if (
          baseline &&
          variantRequestsEqual(request, toVariantRequest(productId, baseline))
        ) {
          continue;
        }

        const currentVariant = await getAdminProductVariant(variant.id);
        const updateRequest: UpdateAdminProductVariantRequest = baseline
          ? mergeVariantRequest(productId, variant, baseline, currentVariant)
          : { ...request, status: variant.status };
        savedVariant = await updateAdminProductVariant(variant.id, updateRequest);
      } else {
        savedVariant = await createAdminProductVariant(request);
      }

      checkpoint = recordPersistedVariant(
        checkpoint,
        index,
        toVariantFormValue(savedVariant),
      );
      variantWorkflowCheckpointRef.current = checkpoint;
    }

    for (const variantId of [...checkpoint.staleVariantIds]) {
      await deleteAdminProductVariant(variantId);
      checkpoint = recordDeletedVariant(checkpoint, variantId);
      variantWorkflowCheckpointRef.current = checkpoint;
    }

    return checkpoint;
  }

  async function applyDesiredVariantStatuses(
    productId: number,
    initialCheckpoint: ProductVariantWorkflowCheckpoint,
  ) {
    let checkpoint = initialCheckpoint;

    for (let index = 0; index < checkpoint.workingVariants.length; index += 1) {
      const persistedVariant = checkpoint.workingVariants[index];
      const desiredStatus = checkpoint.desiredVariants[index]?.status;
      if (
        persistedVariant.id === undefined ||
        desiredStatus === undefined ||
        desiredStatus === persistedVariant.status
      ) {
        continue;
      }

      const currentVariant = await getAdminProductVariant(persistedVariant.id);
      const currentRequest = toVariantRequest(productId, toVariantFormValue(currentVariant));
      const savedVariant = await updateAdminProductVariant(persistedVariant.id, {
        ...currentRequest,
        status: desiredStatus,
      });
      checkpoint = recordPersistedVariant(
        checkpoint,
        index,
        toVariantFormValue(savedVariant),
      );
      variantWorkflowCheckpointRef.current = checkpoint;
    }

    return checkpoint;
  }

  async function generateEnglishContent(model: GeminiContentModel) {
    const source = formValues.translations.vi;
    const nullable = (value: string) => value.trim() || null;

    try {
      const suggestion = await englishSuggestionMutation.mutateAsync({
        model,
        name: source.name.trim(),
        shortDescription: nullable(source.shortDescription),
        description: nullable(source.description),
        material: nullable(source.material),
        careInstruction: nullable(source.careInstruction),
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
            shortDescription: suggestion.shortDescription ?? "",
            description: suggestion.description ?? "",
            material: suggestion.material ?? "",
            careInstruction: suggestion.careInstruction ?? "",
            seoTitle: suggestion.seoTitle ?? "",
            seoDescription: suggestion.seoDescription ?? "",
          },
        },
      }));
      setContentLocale("en");
      toast.success(t("admin.contentGeneration.success"));
    } catch (error) {
      toast.error(
        `${t("admin.contentGeneration.failed")} ${getApiErrorMessage(error)}`,
      );
    }
  }

  async function saveProduct() {

    const categoryId = Number(formValues.categoryId);
    const brandId = Number(formValues.brandId);
    const viTranslation = formValues.translations.vi;
    const enTranslation = formValues.translations.en;
    const name = viTranslation.name.trim();
    const slug = viTranslation.slug.trim();

    if (
      !formValues.categoryId ||
      !formValues.brandId ||
      !Number.isInteger(categoryId) ||
      categoryId <= 0 ||
      !Number.isInteger(brandId) ||
      brandId <= 0 ||
      !isProductTranslationComplete(viTranslation)
    ) {
      setFormTab("details");
      setContentLocale("vi");
      toast.error(t("admin.commerce.products.validation.complete"));
      return;
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      setFormTab("details");
      toast.error(t("admin.commerce.products.validation.slug"));
      return;
    }
    if (!isProductTranslationEmpty(enTranslation)) {
      if (!isProductTranslationComplete(enTranslation)) {
        setFormTab("details");
        setContentLocale("en");
        toast.error(t("admin.commerce.translation.enPartial"));
        return;
      }
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(enTranslation.slug.trim())) {
        setFormTab("details");
        setContentLocale("en");
        toast.error(t("admin.commerce.products.validation.slug"));
        return;
      }
    }

    const variantValidationError = getVariantValidationError(variantValues, t);
    if (variantValidationError) {
      setFormTab("variants");
      toast.error(variantValidationError);
      return;
    }
    if (
      formValues.status !== "ACTIVE" &&
      variantValues.some((variant) => variant.status === "ACTIVE")
    ) {
      setFormTab("variants");
      toast.error(t("admin.commerce.products.validation.activeParent"));
      return;
    }

    const commonRequest: UpdateAdminProductRequest = {
      categoryId,
      brandId,
      name,
      description: viTranslation.description.trim() || null,
      status: formValues.status,
    };
    const changesBaseProduct =
      editingProduct === null || productRequestChanged(editingProduct, commonRequest);
    if (
      changesBaseProduct &&
      (!categories.some((category) => category.id === categoryId) ||
        !brands.some((brand) => brand.id === brandId))
    ) {
      setFormTab("details");
      toast.error(t("admin.commerce.products.validation.catalog"));
      return;
    }

    setIsWorkflowSaving(true);
    const wasCreating = editingProduct === null;
    let product = editingProduct;
    let createdDuringSave = false;
    let productStatusSaved = false;

    try {
      if (!product) {
        const request: CreateAdminProductRequest = {
          ...commonRequest,
          slug,
          status: "DRAFT",
        };
        product = await createAdminProduct(request);
        createdDuringSave = true;
        setEditingProduct(product);
      }

      const translations: ProductTranslation[] = [
        serializeProductTranslation("vi", viTranslation),
      ];
      if (!isProductTranslationEmpty(enTranslation)) {
        translations.push(serializeProductTranslation("en", enTranslation));
      }
      const translationResponse = await updateAdminProductTranslations(product.id, { translations });
      const savedTranslations = translationResponse.translations;
      if (
        isProductTranslationEmpty(enTranslation) &&
        savedTranslations.some((translation) => translation.localeCode === "en")
      ) {
        await deleteAdminProductTranslation(product.id, "en");
      }
      const needsActivationStage =
        formValues.status === "ACTIVE" && product.status !== "ACTIVE";
      let workflowCheckpoint = variantWorkflowCheckpointRef.current;
      if (!workflowCheckpoint || workflowCheckpoint.productId !== product.id) {
        workflowCheckpoint = createProductVariantWorkflowCheckpoint({
          productId: product.id,
          desiredVariants: variantValues,
          knownVariantIds,
          baselineVariants: baselineVariantValues,
          needsActivationStage,
        });
        variantWorkflowCheckpointRef.current = workflowCheckpoint;
      }
      workflowCheckpoint = await persistVariants(product.id, workflowCheckpoint);
      if (createdDuringSave || productRequestChanged(product, commonRequest)) {
        await updateAdminProduct(product.id, commonRequest);
      }
      productStatusSaved = true;
      if (workflowCheckpoint.needsActivationStage) {
        workflowCheckpoint = await applyDesiredVariantStatuses(
          product.id,
          workflowCheckpoint,
        );
      }

      setVariantValues(workflowCheckpoint.workingVariants);
      setKnownVariantIds(workflowCheckpoint.persistedIds);
      setBaselineVariantValues(workflowCheckpoint.persistedBaselines);
      variantWorkflowCheckpointRef.current = null;

      toast.success(
        createdDuringSave
          ? variantValues.length === 1
            ? t("admin.commerce.products.createdOne", { name })
            : t("admin.commerce.products.createdMany", {
                name,
                count: variantValues.length,
              })
          : t("admin.commerce.products.updated", { name })
      );
      setPage(1);
      setFormOpen(false);
      setEditingProduct(null);
    } catch (error) {
      const message = getApiErrorMessage(error);
      if (wasCreating && !product) {
        toast.error(`${t("admin.commerce.products.createFailed", { name })} ${message}`);
      } else if (createdDuringSave && !productStatusSaved) {
        toast.error(`${t("admin.commerce.products.draftPartial", { name })} ${message}`);
      } else if (createdDuringSave) {
        toast.error(`${t("admin.commerce.products.createdPartial", { name })} ${message}`);
      } else {
        toast.error(`${t("admin.commerce.products.savePartial")} ${message}`);
      }
    } finally {
      await Promise.allSettled([
        queryClient.invalidateQueries({ queryKey: adminCommerceQueryKeys.productVariants.root }),
        queryClient.invalidateQueries({ queryKey: adminCommerceQueryKeys.products.root }),
        invalidatePublicQueries(queryClient, ["productLists", "productDetails", "sales"]),
        product
          ? queryClient.invalidateQueries({
              queryKey: adminCommerceQueryKeys.products.translations(product.id),
            })
          : Promise.resolve(),
      ]);
      setIsWorkflowSaving(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void saveProduct();
  }

  async function archiveProductAndVariants() {
    if (!archiveProduct) return;

    const { id, name } = archiveProduct;
    setIsArchiveWorkflowPending(true);
    try {
      const variantsPage = await getAdminProductVariants({
        productId: id,
        page: 1,
        size: 2000,
        sort: "id,asc",
      });
      for (const variant of variantsPage.result) {
        if (variant.status !== "ACTIVE") continue;
        const request = toVariantRequest(id, toVariantFormValue(variant));
        await updateAdminProductVariant(variant.id, { ...request, status: "INACTIVE" });
      }
      await deleteMutation.mutateAsync(id);
      toast.success(t("admin.commerce.products.archived", { name }));
      setArchiveProduct(null);
      setPage(1);
    } catch (error) {
      toast.error(
        `${t("admin.commerce.products.archivePartial")} ${getApiErrorMessage(error)}`
      );
    } finally {
      await Promise.allSettled([
        queryClient.invalidateQueries({ queryKey: adminCommerceQueryKeys.productVariants.root }),
        queryClient.invalidateQueries({ queryKey: adminCommerceQueryKeys.products.root }),
        invalidatePublicQueries(queryClient, ["productLists", "productDetails", "sales"]),
        queryClient.invalidateQueries({
          queryKey: adminCommerceQueryKeys.products.translations(id),
        }),
      ]);
      setIsArchiveWorkflowPending(false);
    }
  }

  function handleArchive() {
    void archiveProductAndVariants();
  }

  function toggleProductStatus(product: AdminProduct, checked: boolean) {
    const status = getProductStatusToggleTarget(product.status, checked);
    if (!status) return;
    statusMutation.mutate(
      { id: product.id, status },
      {
        onSuccess: () =>
          toast.success(t("admin.commerce.translation.statusUpdated", { name: product.name })),
        onError: () =>
          toast.error(t("admin.commerce.translation.statusFailed", { name: product.name })),
      },
    );
  }

  async function toggleVariantStatus(
    variantId: number,
    status: "ACTIVE" | "INACTIVE",
  ) {
    try {
      await variantStatusMutation.mutateAsync({ id: variantId, status });
      toast.success(
        t("admin.commerce.translation.statusUpdated", { name: `SKU #${variantId}` }),
      );
    } catch (error) {
      toast.error(
        `${t("admin.commerce.translation.statusFailed", { name: `SKU #${variantId}` })} ${getApiErrorMessage(error)}`,
      );
      throw error;
    }
  }

  const columns: ManagementColumn<AdminProduct>[] = [
    {
      key: "product",
      header: t("admin.commerce.products.column.product"),
      className: "min-w-72",
      cell: (product) => (
        <div className="flex items-center gap-3">
          <Avatar size="lg" className="rounded-lg">
            <AvatarImage className="rounded-lg" src={resolveAdminAssetUrl(product.thumbnail)} alt="" />
            <AvatarFallback className="rounded-lg">
              <Package className="size-4" />
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-medium">{product.name}</p>
            <p className="max-w-64 truncate text-muted-foreground text-xs">/{product.slug}</p>
            <div className="mt-1 flex gap-1">
              {(["vi", "en"] as const).map((translationLocale) => (
                <Badge
                  key={translationLocale}
                  variant={product.translationLocales?.includes(translationLocale) ? "secondary" : "outline"}
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
      key: "catalog",
      header: t("admin.commerce.products.column.catalog"),
      cell: (product) => (
        <div className="space-y-0.5">
          <p>
            {product.categoryName ??
              t("admin.commerce.products.categoryId", { id: product.categoryId })}
          </p>
          <p className="text-muted-foreground text-xs">
            {brandNames.get(product.brandId) ??
              t("admin.commerce.products.brandId", { id: product.brandId })}
          </p>
        </div>
      ),
    },
    {
      key: "price",
      header: t("admin.commerce.products.column.price"),
      className: "whitespace-nowrap tabular-nums",
      cell: (product) => (
        <span className="font-medium">
          {product.price === null ? "—" : formatCurrency(product.price, locale)}
        </span>
      ),
    },
    {
      key: "status",
      header: t("admin.commerce.common.status"),
      cell: (product) => {
        const toggle = getProductStatusToggleState(product.status);
        const disabled = toggle.disabled || statusMutation.isPending;
        return (
          <div className="flex items-center gap-2">
            <Switch
              size="sm"
              checked={toggle.checked}
              disabled={disabled}
              aria-label={t("admin.commerce.translation.toggleAria", { name: product.name })}
              onCheckedChange={(checked) => toggleProductStatus(product, checked)}
            />
            <Badge variant={getStatusVariant(product.status)}>
              {t(PRODUCT_STATUS_MESSAGE_KEYS[product.status])}
            </Badge>
          </div>
        );
      },
    },
    {
      key: "updatedAt",
      header: t("admin.commerce.common.updated"),
      className: "whitespace-nowrap text-muted-foreground",
      cell: (product) => formatDateTime(product.updatedAt, locale),
    },
    {
      key: "actions",
      header: <span className="sr-only">{t("admin.commerce.common.actions")}</span>,
      headerClassName: "w-24 text-right",
      className: "text-right",
      cell: (product) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("admin.commerce.products.editNamed", { name: product.name })}
            disabled={loadingVariantProductId !== null}
            onClick={() => void openEditForm(product)}
          >
            {loadingVariantProductId === product.id ? <Loader2 className="animate-spin" /> : <Pencil />}
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("admin.commerce.products.archiveNamed", { name: product.name })}
            disabled={loadingVariantProductId !== null}
            onClick={() => setArchiveProduct(product)}
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
        title={t("admin.commerce.products.title")}
        description={t("admin.commerce.products.description")}
        rows={rows}
        columns={columns}
        total={meta?.total ?? 0}
        page={meta?.page ?? page}
        pageSize={pageSize}
        pageCount={meta?.pages ?? 0}
        searchValue={searchValue}
        searchPlaceholder={t("admin.commerce.products.search")}
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
              ...PRODUCT_STATUSES.map((value) => ({
                value,
                label: t(PRODUCT_STATUS_MESSAGE_KEYS[value]),
              })),
            ],
            onValueChange: (value) => {
              setStatusFilter(value ?? ALL_FILTER);
              setPage(1);
            },
          },
          {
            label: t("admin.commerce.products.filter.category"),
            value: categoryFilter,
            options: [
              { label: t("admin.commerce.products.filter.allCategories"), value: ALL_FILTER },
              ...categories.map((category) => ({ label: category.name, value: String(category.id) })),
            ],
            onValueChange: (value) => {
              setCategoryFilter(value ?? ALL_FILTER);
              setPage(1);
            },
          },
          {
            label: t("admin.commerce.products.filter.brand"),
            value: brandFilter,
            options: [
              { label: t("admin.commerce.products.filter.allBrands"), value: ALL_FILTER },
              ...brands.map((brand) => ({ label: brand.name, value: String(brand.id) })),
            ],
            onValueChange: (value) => {
              setBrandFilter(value ?? ALL_FILTER);
              setPage(1);
            },
          },
        ]}
        primaryAction={{
          label: t("admin.commerce.products.add"),
          onClick: openCreateForm,
          disabled: loadingVariantProductId !== null,
        }}
        onRefresh={() => void productsQuery.refetch()}
        onExport={() =>
          downloadCsv(
            "products.csv",
            rows.map((product) => ({
              id: product.id,
              name: product.name,
              slug: product.slug,
              category: product.categoryName,
              brand: brandNames.get(product.brandId),
              price: product.price,
              status: t(PRODUCT_STATUS_MESSAGE_KEYS[product.status]),
              updatedAt: product.updatedAt,
            }))
          )
        }
        isLoading={productsQuery.isPending}
        isFetching={productsQuery.isFetching}
        error={productsQuery.isError ? productsQuery.error : null}
        emptyTitle={t("admin.commerce.products.emptyTitle")}
        emptyDescription={t("admin.commerce.products.emptyDescription")}
      />

      <ResourceFormSheet
        open={formOpen}
        onOpenChange={(open) => {
          if (!isSaving) setFormOpen(open);
        }}
        title={
          editingProduct
            ? t("admin.commerce.products.edit")
            : t("admin.commerce.products.add")
        }
        description={t("admin.commerce.products.formDescription")}
        onSubmit={handleSubmit}
        isPending={isSaving}
        submitDisabled={
          categoriesQuery.isPending ||
          brandsQuery.isPending ||
          categoriesQuery.isError ||
          brandsQuery.isError ||
          categories.length === 0 ||
          brands.length === 0
        }
        submitLabel={
          editingProduct
            ? t("admin.commerce.products.save")
            : t("admin.commerce.products.create")
        }
        contentClassName="sm:max-w-4xl"
      >
        <Tabs value={formTab} onValueChange={setFormTab} className="gap-5">
          <TabsList variant="line" className="w-full justify-start">
            <TabsTrigger value="details">
              {t("admin.commerce.products.tab.details")}
            </TabsTrigger>
            <TabsTrigger value="variants">
              {t("admin.commerce.products.tab.variants", { count: variantValues.length })}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="details">
            <ProductForm
              values={formValues}
              onChange={setFormValues}
              contentLocale={contentLocale}
              onContentLocaleChange={setContentLocale}
              categories={productCategoryOptions}
              brands={productBrandOptions}
              isCatalogLoading={categoriesQuery.isPending || brandsQuery.isPending}
              catalogError={
                categoriesQuery.isError
                  ? getApiErrorMessage(categoriesQuery.error)
                  : brandsQuery.isError
                    ? getApiErrorMessage(brandsQuery.error)
                    : null
              }
              isGeneratingEnglish={englishSuggestionMutation.isPending}
              onGenerateEnglish={generateEnglishContent}
            />
          </TabsContent>
          <TabsContent value="variants">
            <ProductVariantsForm
              variants={variantValues}
              onChange={setVariantValues}
              colors={colors}
              sizes={sizes}
              isCatalogLoading={colorsQuery.isPending || sizesQuery.isPending}
              catalogError={
                colorsQuery.isError
                  ? getApiErrorMessage(colorsQuery.error)
                  : sizesQuery.isError
                    ? getApiErrorMessage(sizesQuery.error)
                    : null
              }
              pendingStatusVariantId={
                variantStatusMutation.isPending ? variantStatusMutation.variables?.id : null
              }
              onPersistedStatusToggle={toggleVariantStatus}
            />
          </TabsContent>
        </Tabs>
      </ResourceFormSheet>

      <DeleteResourceDialog
        open={Boolean(archiveProduct)}
        onOpenChange={(open) => {
          if (!open && !isArchiveWorkflowPending && !deleteMutation.isPending) setArchiveProduct(null);
        }}
        resourceName={archiveProduct?.name ?? t("admin.commerce.products.resource")}
        actionLabel={t("admin.commerce.products.archive")}
        description={t("admin.commerce.products.archiveDescription")}
        onConfirm={handleArchive}
        isPending={isArchiveWorkflowPending || deleteMutation.isPending}
      />
    </>
  );
}
