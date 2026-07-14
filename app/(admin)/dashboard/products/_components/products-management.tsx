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
  formatAdminDateTime,
  formatCurrency,
  getApiErrorMessage,
  resolveAdminAssetUrl,
} from "@/app/(admin)/dashboard/_components/management/resource-utils";
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

const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  DRAFT: "Draft",
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  OUT_OF_STOCK: "Out of stock",
};

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

function getVariantValidationError(variants: ProductVariantFormValue[]) {
  if (variants.length === 0) return "Add at least one product variant before saving.";

  const skus = new Set<string>();
  const combinations = new Set<string>();

  for (const [index, variant] of variants.entries()) {
    const label = `Variant ${index + 1}`;
    const sku = variant.sku.trim();
    const price = Number(variant.price);
    const salePrice = variant.salePrice.trim() === "" ? null : Number(variant.salePrice);
    const stock = Number(variant.stockQuantity);

    if (!sku) return `${label} requires a SKU.`;
    if (skus.has(sku.toLowerCase())) return `SKU ${sku} is duplicated in this product.`;
    skus.add(sku.toLowerCase());

    if (variant.price.trim() === "" || !Number.isFinite(price) || price < 0) {
      return `${label} price must be a non-negative number.`;
    }
    if (salePrice !== null && (!Number.isFinite(salePrice) || salePrice <= 0 || salePrice >= price)) {
      return `${label} sale price must be greater than 0 and lower than its regular price.`;
    }
    if (variant.stockQuantity.trim() === "" || !Number.isInteger(stock) || stock < 0) {
      return `${label} stock must be a non-negative whole number.`;
    }
    if (stock === 0 && variant.status === "ACTIVE") {
      return `${label} cannot be active while its stock is 0.`;
    }
    if (stock > 0 && variant.status === "OUT_OF_STOCK") {
      return `${label} has stock available, so choose a status other than Out of stock.`;
    }

    const combination = `${variant.colorId || "none"}:${variant.sizeId || "none"}`;
    if (combinations.has(combination)) {
      return `${label} repeats a color and size combination already used above.`;
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
  });
  const categoriesQuery = useAdminCategoriesQuery();
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
      name: editingProduct.categoryName ?? `Archived category #${editingProduct.categoryId}`,
    });
  }
  if (
    editingProduct &&
    !productBrandOptions.some((brand) => brand.id === editingProduct.brandId)
  ) {
    productBrandOptions.push({
      id: editingProduct.brandId,
      name: `Archived brand #${editingProduct.brandId}`,
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
      toast.error(`Unable to load product variants. ${getApiErrorMessage(error)}`);
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
      toast.error("Complete the required product fields before saving.");
      return;
    }
    if (!editingProduct && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      setFormTab("details");
      toast.error("Use a lowercase URL-safe slug with words separated by hyphens.");
      return;
    }

    const variantValidationError = getVariantValidationError(variantValues);
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
      toast.error("Active variants require the parent product to be active as well.");
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
      toast.error("Choose an available category and brand before changing product details.");
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
          ? `${name} and ${variantValues.length} variant${variantValues.length === 1 ? "" : "s"} were created.`
          : `${name} and its variants were updated.`
      );
      setPage(1);
      setFormOpen(false);
      setEditingProduct(null);
    } catch (error) {
      const message = getApiErrorMessage(error);
      if (wasCreating && !product) {
        toast.error(`Unable to create ${name}. ${message}`);
      } else if (createdDuringSave && !productStatusSaved) {
        toast.error(`${name} was kept as a draft, but the variant workflow did not finish. ${message}`);
      } else if (createdDuringSave) {
        toast.error(`${name} was created, but some variant statuses did not finish updating. ${message}`);
      } else {
        toast.error(`The save did not finish; completed variant changes were kept. ${message}`);
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
      toast.success(`${name} and its active variants were archived.`);
      setArchiveProduct(null);
      setPage(1);
    } catch (error) {
      toast.error(`The archive workflow did not finish. ${getApiErrorMessage(error)}`);
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
      header: "Product",
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
      header: "Category / brand",
      cell: (product) => (
        <div className="space-y-0.5">
          <p>{product.categoryName ?? `Category #${product.categoryId}`}</p>
          <p className="text-muted-foreground text-xs">
            {brandNames.get(product.brandId) ?? `Brand #${product.brandId}`}
          </p>
        </div>
      ),
    },
    {
      key: "price",
      header: "Variant price",
      className: "whitespace-nowrap tabular-nums",
      cell: (product) =>
        product.salePrice !== null ? (
          <div className="space-y-0.5">
            <p className="font-medium">{formatCurrency(product.salePrice)}</p>
            <p className="text-muted-foreground text-xs line-through">{formatCurrency(product.price)}</p>
          </div>
        ) : (
          <span className="font-medium">{formatCurrency(product.price)}</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      cell: (product) => (
        <Badge variant={getStatusVariant(product.status)}>{PRODUCT_STATUS_LABELS[product.status]}</Badge>
      ),
    },
    {
      key: "updatedAt",
      header: "Updated",
      className: "whitespace-nowrap text-muted-foreground",
      cell: (product) => formatAdminDateTime(product.updatedAt),
    },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      headerClassName: "w-24 text-right",
      className: "text-right",
      cell: (product) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Edit ${product.name}`}
            disabled={loadingVariantProductId !== null}
            onClick={() => void openEditForm(product)}
          >
            {loadingVariantProductId === product.id ? <Loader2 className="animate-spin" /> : <Pencil />}
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Archive ${product.name}`}
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
        title="Products"
        description="Manage catalog details, sellable variants, pricing, and inventory from one product workflow."
        rows={rows}
        columns={columns}
        total={meta?.total ?? 0}
        page={meta?.page ?? page}
        pageSize={pageSize}
        pageCount={meta?.pages ?? 0}
        searchValue={searchValue}
        searchPlaceholder="Search product names..."
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
              ...Object.entries(PRODUCT_STATUS_LABELS).map(([value, label]) => ({ value, label })),
            ],
            onValueChange: (value) => {
              setStatusFilter(value ?? ALL_FILTER);
              setPage(1);
            },
          },
          {
            label: "Category",
            value: categoryFilter,
            options: [
              { label: "All categories", value: ALL_FILTER },
              ...categories.map((category) => ({ label: category.name, value: String(category.id) })),
            ],
            onValueChange: (value) => {
              setCategoryFilter(value ?? ALL_FILTER);
              setPage(1);
            },
          },
          {
            label: "Brand",
            value: brandFilter,
            options: [
              { label: "All brands", value: ALL_FILTER },
              ...brands.map((brand) => ({ label: brand.name, value: String(brand.id) })),
            ],
            onValueChange: (value) => {
              setBrandFilter(value ?? ALL_FILTER);
              setPage(1);
            },
          },
        ]}
        primaryAction={{
          label: "Add product",
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
              status: product.status,
              updatedAt: product.updatedAt,
            }))
          )
        }
        isLoading={productsQuery.isPending}
        isFetching={productsQuery.isFetching}
        error={productsQuery.isError ? getApiErrorMessage(productsQuery.error) : null}
        emptyTitle="No products found"
        emptyDescription="Add a product or adjust the current search and catalog filters."
      />

      <ResourceFormSheet
        open={formOpen}
        onOpenChange={(open) => {
          if (!isSaving) setFormOpen(open);
        }}
        title={editingProduct ? "Edit product" : "Add product"}
        description="Save the product details together with every SKU, price, color, size, and stock quantity."
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
        submitLabel={editingProduct ? "Save product" : "Create product"}
        contentClassName="sm:max-w-4xl"
      >
        <Tabs value={formTab} onValueChange={setFormTab} className="gap-5">
          <TabsList variant="line" className="w-full justify-start">
            <TabsTrigger value="details">Product details</TabsTrigger>
            <TabsTrigger value="variants">Variants & inventory ({variantValues.length})</TabsTrigger>
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
        resourceName={archiveProduct?.name ?? "product"}
        actionLabel="Archive"
        description="This first disables active variants, then softly archives the product. Existing order history is preserved."
        onConfirm={handleArchive}
        isPending={isArchiveWorkflowPending || deleteMutation.isPending}
      />
    </>
  );
}
