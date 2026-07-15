"use client";

import { type FormEvent, useDeferredValue, useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  createAdminProduct,
  createAdminProductVariant,
  deleteAdminProductVariant,
  getAdminProductVariant,
  getAdminProductVariants,
  updateAdminProduct,
  updateAdminProductVariant,
} from "@/lib/api/admin-commerce";
import { formatCurrency, formatDateTime } from "@/lib/i18n/format";
import type {
  AdminCatalogOption,
  AdminProduct,
  AdminProductVariant,
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
} from "@/lib/queries/admin-commerce";

import { EMPTY_PRODUCT_FORM, ProductForm, type ProductFormValues } from "./product-form";
import {
  createEmptyProductVariant,
  ProductVariantsForm,
  type ProductVariantFormValue,
} from "./product-variants-form";

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

function toFormValues(product: AdminProduct): ProductFormValues {
  return {
    categoryId: String(product.categoryId),
    brandId: String(product.brandId),
    name: product.name,
    slug: product.originalSlug || product.slug,
    description: product.description ?? "",
    status: product.status,
  };
}

function toVariantFormValue(variant: AdminProductVariant): ProductVariantFormValue {
  return {
    key: `variant-${variant.id}`,
    id: variant.id,
    sku: variant.sku,
    price: String(variant.price),
    salePrice: variant.salePrice === null ? "" : String(variant.salePrice),
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
    salePrice: variant.salePrice.trim() === "" ? null : Number(variant.salePrice),
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
    const salePrice = variant.salePrice.trim() === "" ? null : Number(variant.salePrice);
    const stock = Number(variant.stockQuantity);

    if (!sku) return t("admin.commerce.products.validation.skuRequired", { number });
    if (skus.has(sku.toLowerCase())) {
      return t("admin.commerce.products.validation.duplicateSku", { sku });
    }
    skus.add(sku.toLowerCase());

    if (variant.price.trim() === "" || !Number.isFinite(price) || price < 0) {
      return t("admin.commerce.products.validation.price", { number });
    }
    if (salePrice !== null && (!Number.isFinite(salePrice) || salePrice <= 0 || salePrice >= price)) {
      return t("admin.commerce.products.validation.salePrice", { number });
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
    left.salePrice === right.salePrice &&
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
    salePrice:
      desiredRequest.salePrice !== baselineRequest.salePrice
        ? desiredRequest.salePrice
        : currentRequest.salePrice,
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
  const [variantValues, setVariantValues] = useState<ProductVariantFormValue[]>([
    createEmptyProductVariant("new-0"),
  ]);
  const [knownVariantIds, setKnownVariantIds] = useState<number[]>([]);
  const [baselineVariantValues, setBaselineVariantValues] = useState<ProductVariantFormValue[]>([]);
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
  const isSaving = isWorkflowSaving;

  function openCreateForm() {
    setEditingProduct(null);
    setFormValues({ ...EMPTY_PRODUCT_FORM });
    setVariantValues([createEmptyProductVariant(`new-${Date.now()}`)]);
    setKnownVariantIds([]);
    setBaselineVariantValues([]);
    setFormTab("details");
    setFormOpen(true);
  }

  async function openEditForm(product: AdminProduct) {
    setLoadingVariantProductId(product.id);
    try {
      const variantsPage = await getAdminProductVariants({
        productId: product.id,
        page: 1,
        size: 2000,
        sort: "id,asc",
      });
      const loadedVariants = variantsPage.result.map(toVariantFormValue);

      setEditingProduct(product);
      setFormValues(toFormValues(product));
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
        `${t("admin.commerce.products.loadVariantsFailed")} ${getApiErrorMessage(error)}`
      );
    } finally {
      setLoadingVariantProductId(null);
    }
  }

  async function persistVariants(
    productId: number,
    variantsToPersist: ProductVariantFormValue[] = variantValues
  ) {
    let workingVariants = [...variantsToPersist];
    let persistedIds = [...knownVariantIds];
    let persistedBaselines = [...baselineVariantValues];
    const desiredIds = new Set(
      workingVariants.flatMap((variant) => (variant.id === undefined ? [] : [variant.id]))
    );

    for (const [index, variant] of workingVariants.entries()) {
      const request = toVariantRequest(productId, variant);
      let savedVariant: AdminProductVariant;

      if (variant.id !== undefined) {
        const baseline = persistedBaselines.find((item) => item.id === variant.id);
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
        persistedIds = [...persistedIds, savedVariant.id];
        setKnownVariantIds(persistedIds);
      }

      workingVariants = workingVariants.map((item, itemIndex) =>
        itemIndex === index ? toVariantFormValue(savedVariant) : item
      );
      persistedBaselines = [
        ...persistedBaselines.filter((item) => item.id !== savedVariant.id),
        toVariantFormValue(savedVariant),
      ];
      setVariantValues(workingVariants);
      setBaselineVariantValues(persistedBaselines);
    }

    for (const variantId of persistedIds.filter((id) => !desiredIds.has(id))) {
      await deleteAdminProductVariant(variantId);
      persistedIds = persistedIds.filter((id) => id !== variantId);
      persistedBaselines = persistedBaselines.filter((variant) => variant.id !== variantId);
      setKnownVariantIds(persistedIds);
      setBaselineVariantValues(persistedBaselines);
    }

    setKnownVariantIds(workingVariants.flatMap((variant) => (variant.id === undefined ? [] : [variant.id])));
    setBaselineVariantValues(persistedBaselines);
    return workingVariants;
  }

  async function applyDesiredVariantStatuses(
    productId: number,
    persistedVariants: ProductVariantFormValue[],
    desiredVariants: ProductVariantFormValue[]
  ) {
    let workingVariants = [...persistedVariants];

    for (const [index, persistedVariant] of workingVariants.entries()) {
      const desiredStatus = desiredVariants[index]?.status;
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
      workingVariants = workingVariants.map((variant, itemIndex) =>
        itemIndex === index ? toVariantFormValue(savedVariant) : variant
      );
      setVariantValues(workingVariants);
      setBaselineVariantValues(workingVariants);
    }

    return workingVariants;
  }

  async function saveProduct() {

    const categoryId = Number(formValues.categoryId);
    const brandId = Number(formValues.brandId);
    const name = formValues.name.trim();
    const slug = formValues.slug.trim();

    if (
      !formValues.categoryId ||
      !formValues.brandId ||
      !Number.isInteger(categoryId) ||
      categoryId <= 0 ||
      !Number.isInteger(brandId) ||
      brandId <= 0 ||
      !name ||
      (!editingProduct && !slug)
    ) {
      setFormTab("details");
      toast.error(t("admin.commerce.products.validation.complete"));
      return;
    }
    if (!editingProduct && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      setFormTab("details");
      toast.error(t("admin.commerce.products.validation.slug"));
      return;
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
      description: formValues.description.trim() || null,
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

      const desiredVariants = [...variantValues];
      const needsActivationStage =
        formValues.status === "ACTIVE" && product.status !== "ACTIVE";
      const stagedVariants = needsActivationStage
        ? desiredVariants.map((variant) => ({
            ...variant,
            status: variant.status === "ACTIVE" ? ("INACTIVE" as const) : variant.status,
          }))
        : desiredVariants;
      const persistedVariants = await persistVariants(product.id, stagedVariants);
      if (createdDuringSave || productRequestChanged(product, commonRequest)) {
        await updateAdminProduct(product.id, commonRequest);
      }
      productStatusSaved = true;
      if (needsActivationStage) {
        await applyDesiredVariantStatuses(product.id, persistedVariants, desiredVariants);
      }

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
      ]);
      setIsArchiveWorkflowPending(false);
    }
  }

  function handleArchive() {
    void archiveProductAndVariants();
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
      cell: (product) =>
        product.salePrice !== null ? (
          <div className="space-y-0.5">
            <p className="font-medium">{formatCurrency(product.salePrice, locale)}</p>
            <p className="text-muted-foreground text-xs line-through">
              {product.price === null ? "—" : formatCurrency(product.price, locale)}
            </p>
          </div>
        ) : (
          <span className="font-medium">
            {product.price === null ? "—" : formatCurrency(product.price, locale)}
          </span>
        ),
    },
    {
      key: "status",
      header: t("admin.commerce.common.status"),
      cell: (product) => (
        <Badge variant={getStatusVariant(product.status)}>
          {t(PRODUCT_STATUS_MESSAGE_KEYS[product.status])}
        </Badge>
      ),
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
              salePrice: product.salePrice,
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
              categories={productCategoryOptions}
              brands={productBrandOptions}
              isEditing={Boolean(editingProduct)}
              isCatalogLoading={categoriesQuery.isPending || brandsQuery.isPending}
              catalogError={
                categoriesQuery.isError
                  ? getApiErrorMessage(categoriesQuery.error)
                  : brandsQuery.isError
                    ? getApiErrorMessage(brandsQuery.error)
                    : null
              }
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
