"use client";

import {
  keepPreviousData,
  type QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createAdminBrand,
  createAdminCategory,
  createAdminColor,
  createAdminCoupon,
  createAdminProduct,
  createAdminProductVariant,
  createAdminSize,
  deleteAdminBrand,
  deleteAdminCategory,
  deleteAdminCategoryTranslation,
  deleteAdminColor,
  deleteAdminCoupon,
  deleteAdminProduct,
  deleteAdminProductTranslation,
  deleteAdminProductVariant,
  deleteAdminSize,
  getAdminBrand,
  getAdminBrands,
  getAdminCategory,
  getAdminCategories,
  getAdminCategoryTranslations,
  getAdminColor,
  getAdminColors,
  getAdminCoupons,
  getAdminProductVariant,
  getAdminProductVariants,
  getAdminProducts,
  getAdminProductTranslations,
  getAdminSize,
  getAdminSizes,
  updateAdminBrand,
  updateAdminBrandStatus,
  updateAdminCategory,
  updateAdminCategoryStatus,
  updateAdminCategoryTranslations,
  updateAdminColor,
  updateAdminCoupon,
  updateAdminProduct,
  updateAdminProductStatus,
  updateAdminProductTranslations,
  updateAdminProductVariant,
  updateAdminProductVariantStatus,
  updateAdminSize,
  type AdminBrand,
  type AdminBrandListParams,
  type AdminCatalogStatus,
  type AdminCategory,
  type AdminCategoryListParams,
  type AdminColorListParams,
  type AdminCouponListParams,
  type AdminPage,
  type AdminProduct,
  type AdminProductVariant,
  type AdminProductVariantListParams,
  type AdminProductListParams,
  type AdminSizeListParams,
  type CreateAdminBrandRequest,
  type CreateAdminCategoryRequest,
  type CreateAdminColorRequest,
  type CreateAdminCouponRequest,
  type CreateAdminProductRequest,
  type CreateAdminProductVariantRequest,
  type CreateAdminSizeRequest,
  type CategoryTranslationBatchRequest,
  type ProductStatus,
  type ProductTranslationBatchRequest,
  type ProductVariantStatus,
  type UpdateAdminBrandRequest,
  type UpdateAdminCategoryRequest,
  type UpdateAdminColorRequest,
  type UpdateAdminCouponRequest,
  type UpdateAdminProductRequest,
  type UpdateAdminProductVariantRequest,
  type UpdateAdminSizeRequest,
} from "@/lib/api/admin-commerce";
import { invalidatePublicQueries } from "@/lib/queries/public-cache";
import { useAdminMutation } from "@/lib/queries/admin-mutation-helper";

export const adminCommerceQueryKeys = {
  root: ["admin-commerce"] as const,
  products: {
    root: ["admin-commerce", "products"] as const,
    lists: ["admin-commerce", "products", "list"] as const,
    list: (params: AdminProductListParams) =>
      ["admin-commerce", "products", "list", params] as const,
    translations: (id: number) => ["admin-commerce", "products", id, "translations"] as const,
  },
  productVariants: {
    root: ["admin-commerce", "product-variants"] as const,
    lists: ["admin-commerce", "product-variants", "list"] as const,
    list: (params: AdminProductVariantListParams) =>
      ["admin-commerce", "product-variants", "list", params] as const,
    detail: (id: number) => ["admin-commerce", "product-variants", "detail", id] as const,
  },
  coupons: {
    root: ["admin-commerce", "coupons"] as const,
    list: (params: AdminCouponListParams) => ["admin-commerce", "coupons", "list", params] as const,
  },
  categories: {
    root: ["admin-commerce", "categories"] as const,
    lists: ["admin-commerce", "categories", "list"] as const,
    list: (params: AdminCategoryListParams) =>
      ["admin-commerce", "categories", "list", params] as const,
    detail: (id: number, locale?: string) =>
      ["admin-commerce", "categories", "detail", id, locale] as const,
    translations: (id: number) => ["admin-commerce", "categories", id, "translations"] as const,
  },
  brands: {
    root: ["admin-commerce", "brands"] as const,
    lists: ["admin-commerce", "brands", "list"] as const,
    list: (params: AdminBrandListParams) => ["admin-commerce", "brands", "list", params] as const,
    detail: (id: number) => ["admin-commerce", "brands", "detail", id] as const,
  },
  colors: {
    root: ["admin-commerce", "colors"] as const,
    lists: ["admin-commerce", "colors", "list"] as const,
    list: (params: AdminColorListParams) => ["admin-commerce", "colors", "list", params] as const,
    detail: (id: number) => ["admin-commerce", "colors", "detail", id] as const,
  },
  sizes: {
    root: ["admin-commerce", "sizes"] as const,
    lists: ["admin-commerce", "sizes", "list"] as const,
    list: (params: AdminSizeListParams) => ["admin-commerce", "sizes", "list", params] as const,
    detail: (id: number) => ["admin-commerce", "sizes", "detail", id] as const,
  },
} as const;

const defaultCatalogOptionParams = {
  page: 1,
  size: 100,
} as const;

const PRODUCT_PUBLIC_AREAS = ["productLists", "productDetails", "sales"] as const;
const CATEGORY_PUBLIC_AREAS = ["categories", "productLists", "productDetails"] as const;
const BRAND_PUBLIC_AREAS = ["brands", "productLists", "productDetails"] as const;
const VARIANT_PUBLIC_AREAS = ["productLists", "productDetails", "sales"] as const;

type StatusRecord = { id: number; status: string };

function optimisticallySetStatus<T extends StatusRecord>(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
  id: number,
  status: T["status"],
) {
  const previous = queryClient.getQueriesData<AdminPage<T>>({ queryKey });
  queryClient.setQueriesData<AdminPage<T>>({ queryKey }, (page) =>
    page
      ? {
          ...page,
          result: page.result.map((item) => (item.id === id ? { ...item, status } : item)),
        }
      : page,
  );
  return previous;
}

function restoreAdminPages<T>(
  queryClient: QueryClient,
  pages: Array<[readonly unknown[], AdminPage<T> | undefined]> | undefined,
) {
  pages?.forEach(([queryKey, page]) => queryClient.setQueryData(queryKey, page));
}

export function useAdminProductsQuery(params: AdminProductListParams) {
  return useQuery({
    queryKey: adminCommerceQueryKeys.products.list(params),
    queryFn: () => getAdminProducts(params),
    placeholderData: (previousData, previousQuery) =>
      (previousQuery?.queryKey[3] as AdminProductListParams | undefined)?.locale === params.locale
        ? previousData
        : undefined,
  });
}

export function useAdminProductTranslationsQuery(id?: number) {
  return useQuery({
    queryKey: adminCommerceQueryKeys.products.translations(id ?? 0),
    queryFn: () => getAdminProductTranslations(id as number),
    enabled: typeof id === "number" && id > 0,
  });
}

export function useUpdateAdminProductTranslationsMutation() {
  return useAdminMutation({
    mutationFn: ({ id, request }: { id: number; request: ProductTranslationBatchRequest }) =>
      updateAdminProductTranslations(id, request),
    invalidateKeys: (variables) => [
      adminCommerceQueryKeys.products.root,
      adminCommerceQueryKeys.products.translations(variables.id),
    ],
    publicAreas: PRODUCT_PUBLIC_AREAS,
  });
}

export function useDeleteAdminProductTranslationMutation() {
  return useAdminMutation({
    mutationFn: ({ id, locale }: { id: number; locale: "en" | "vi" }) =>
      deleteAdminProductTranslation(id, locale),
    invalidateKeys: (variables) => [
      adminCommerceQueryKeys.products.root,
      adminCommerceQueryKeys.products.translations(variables.id),
    ],
    publicAreas: PRODUCT_PUBLIC_AREAS,
  });
}

export function useAdminCategoriesQuery(params?: AdminCategoryListParams) {
  const resolvedParams = params ?? defaultCatalogOptionParams;

  return useQuery({
    queryKey: adminCommerceQueryKeys.categories.list(resolvedParams),
    queryFn: () => getAdminCategories(resolvedParams),
    staleTime: 5 * 60 * 1000,
    placeholderData: params
      ? (previousData, previousQuery) =>
          (previousQuery?.queryKey[3] as AdminCategoryListParams | undefined)?.locale ===
          params.locale
            ? previousData
            : undefined
      : undefined,
  });
}

export function useAdminCategoryQuery(id?: number, locale?: string) {
  return useQuery({
    queryKey: adminCommerceQueryKeys.categories.detail(id ?? 0, locale),
    queryFn: () => getAdminCategory(id as number, locale),
    enabled: typeof id === "number",
  });
}

export function useAdminCategoryTranslationsQuery(id?: number) {
  return useQuery({
    queryKey: adminCommerceQueryKeys.categories.translations(id ?? 0),
    queryFn: () => getAdminCategoryTranslations(id as number),
    enabled: typeof id === "number" && id > 0,
  });
}

export function useUpdateAdminCategoryTranslationsMutation() {
  return useAdminMutation({
    mutationFn: ({ id, request }: { id: number; request: CategoryTranslationBatchRequest }) =>
      updateAdminCategoryTranslations(id, request),
    invalidateKeys: (variables) => [
      adminCommerceQueryKeys.categories.root,
      adminCommerceQueryKeys.categories.translations(variables.id),
    ],
    publicAreas: CATEGORY_PUBLIC_AREAS,
  });
}

export function useDeleteAdminCategoryTranslationMutation() {
  return useAdminMutation({
    mutationFn: ({ id, locale }: { id: number; locale: "en" | "vi" }) =>
      deleteAdminCategoryTranslation(id, locale),
    invalidateKeys: (variables) => [
      adminCommerceQueryKeys.categories.root,
      adminCommerceQueryKeys.categories.translations(variables.id),
    ],
    publicAreas: CATEGORY_PUBLIC_AREAS,
  });
}

export function useCreateAdminCategoryMutation() {
  return useAdminMutation({
    mutationFn: (request: CreateAdminCategoryRequest) => createAdminCategory(request),
    invalidateKeys: () => [adminCommerceQueryKeys.categories.root],
    publicAreas: CATEGORY_PUBLIC_AREAS,
  });
}

export function useUpdateAdminCategoryMutation() {
  return useAdminMutation({
    mutationFn: ({ id, request }: { id: number; request: UpdateAdminCategoryRequest }) =>
      updateAdminCategory(id, request),
    invalidateKeys: () => [
      adminCommerceQueryKeys.categories.root,
      adminCommerceQueryKeys.products.root,
    ],
    publicAreas: CATEGORY_PUBLIC_AREAS,
  });
}

export function useDeleteAdminCategoryMutation() {
  return useAdminMutation({
    mutationFn: (id: number) => deleteAdminCategory(id),
    invalidateKeys: () => [
      adminCommerceQueryKeys.categories.root,
      adminCommerceQueryKeys.products.root,
    ],
    publicAreas: CATEGORY_PUBLIC_AREAS,
  });
}

export function useAdminBrandsQuery(params?: AdminBrandListParams) {
  const resolvedParams = params ?? defaultCatalogOptionParams;

  return useQuery({
    queryKey: adminCommerceQueryKeys.brands.list(resolvedParams),
    queryFn: () => getAdminBrands(resolvedParams),
    staleTime: 5 * 60 * 1000,
    placeholderData: params ? keepPreviousData : undefined,
  });
}

export function useAdminBrandQuery(id?: number) {
  return useQuery({
    queryKey: adminCommerceQueryKeys.brands.detail(id ?? 0),
    queryFn: () => getAdminBrand(id as number),
    enabled: typeof id === "number",
  });
}

export function useCreateAdminBrandMutation() {
  return useAdminMutation({
    mutationFn: (request: CreateAdminBrandRequest) => createAdminBrand(request),
    invalidateKeys: () => [adminCommerceQueryKeys.brands.root],
  });
}

export function useUpdateAdminBrandMutation() {
  return useAdminMutation({
    mutationFn: ({ id, request }: { id: number; request: UpdateAdminBrandRequest }) =>
      updateAdminBrand(id, request),
    invalidateKeys: () => [
      adminCommerceQueryKeys.brands.root,
      adminCommerceQueryKeys.products.root,
    ],
  });
}

export function useDeleteAdminBrandMutation() {
  return useAdminMutation({
    mutationFn: (id: number) => deleteAdminBrand(id),
    invalidateKeys: () => [
      adminCommerceQueryKeys.brands.root,
      adminCommerceQueryKeys.products.root,
    ],
  });
}

export function useAdminColorsQuery(params?: AdminColorListParams) {
  const resolvedParams = params ?? defaultCatalogOptionParams;

  return useQuery({
    queryKey: adminCommerceQueryKeys.colors.list(resolvedParams),
    queryFn: () => getAdminColors(resolvedParams),
    staleTime: 5 * 60 * 1000,
    placeholderData: params ? keepPreviousData : undefined,
  });
}

export function useAdminColorQuery(id?: number) {
  return useQuery({
    queryKey: adminCommerceQueryKeys.colors.detail(id ?? 0),
    queryFn: () => getAdminColor(id as number),
    enabled: typeof id === "number",
  });
}

export function useCreateAdminColorMutation() {
  return useAdminMutation({
    mutationFn: (request: CreateAdminColorRequest) => createAdminColor(request),
    invalidateKeys: () => [adminCommerceQueryKeys.colors.root],
  });
}

export function useUpdateAdminColorMutation() {
  return useAdminMutation({
    mutationFn: ({ id, request }: { id: number; request: UpdateAdminColorRequest }) =>
      updateAdminColor(id, request),
    invalidateKeys: () => [
      adminCommerceQueryKeys.colors.root,
      adminCommerceQueryKeys.productVariants.root,
    ],
  });
}

export function useDeleteAdminColorMutation() {
  return useAdminMutation({
    mutationFn: (id: number) => deleteAdminColor(id),
    invalidateKeys: () => [
      adminCommerceQueryKeys.colors.root,
      adminCommerceQueryKeys.productVariants.root,
    ],
  });
}

export function useAdminSizesQuery(params?: AdminSizeListParams) {
  const resolvedParams = params ?? defaultCatalogOptionParams;

  return useQuery({
    queryKey: adminCommerceQueryKeys.sizes.list(resolvedParams),
    queryFn: () => getAdminSizes(resolvedParams),
    staleTime: 5 * 60 * 1000,
    placeholderData: params ? keepPreviousData : undefined,
  });
}

export function useAdminSizeQuery(id?: number) {
  return useQuery({
    queryKey: adminCommerceQueryKeys.sizes.detail(id ?? 0),
    queryFn: () => getAdminSize(id as number),
    enabled: typeof id === "number",
  });
}

export function useCreateAdminSizeMutation() {
  return useAdminMutation({
    mutationFn: (request: CreateAdminSizeRequest) => createAdminSize(request),
    invalidateKeys: () => [adminCommerceQueryKeys.sizes.root],
  });
}

export function useUpdateAdminSizeMutation() {
  return useAdminMutation({
    mutationFn: ({ id, request }: { id: number; request: UpdateAdminSizeRequest }) =>
      updateAdminSize(id, request),
    invalidateKeys: () => [
      adminCommerceQueryKeys.sizes.root,
      adminCommerceQueryKeys.productVariants.root,
    ],
  });
}

export function useDeleteAdminSizeMutation() {
  return useAdminMutation({
    mutationFn: (id: number) => deleteAdminSize(id),
    invalidateKeys: () => [
      adminCommerceQueryKeys.sizes.root,
      adminCommerceQueryKeys.productVariants.root,
    ],
  });
}

export function useCreateAdminProductMutation() {
  return useAdminMutation({
    mutationFn: (request: CreateAdminProductRequest) => createAdminProduct(request),
    invalidateKeys: () => [adminCommerceQueryKeys.products.root],
    publicAreas: PRODUCT_PUBLIC_AREAS,
  });
}

export function useUpdateAdminProductMutation() {
  return useAdminMutation({
    mutationFn: ({ id, request }: { id: number; request: UpdateAdminProductRequest }) =>
      updateAdminProduct(id, request),
    invalidateKeys: () => [adminCommerceQueryKeys.products.root],
    publicAreas: PRODUCT_PUBLIC_AREAS,
  });
}

export function useDeleteAdminProductMutation() {
  return useAdminMutation({
    mutationFn: (id: number) => deleteAdminProduct(id),
    invalidateKeys: () => [adminCommerceQueryKeys.products.root],
    publicAreas: PRODUCT_PUBLIC_AREAS,
  });
}

export function useAdminProductVariantsQuery(params: AdminProductVariantListParams = {}) {
  return useQuery({
    queryKey: adminCommerceQueryKeys.productVariants.list(params),
    queryFn: () => getAdminProductVariants(params),
    placeholderData: keepPreviousData,
  });
}

export function useAdminProductVariantQuery(id?: number) {
  return useQuery({
    queryKey: adminCommerceQueryKeys.productVariants.detail(id ?? 0),
    queryFn: () => getAdminProductVariant(id as number),
    enabled: typeof id === "number",
  });
}

export function useCreateAdminProductVariantMutation() {
  return useAdminMutation({
    mutationFn: (request: CreateAdminProductVariantRequest) => createAdminProductVariant(request),
    invalidateKeys: () => [
      adminCommerceQueryKeys.productVariants.root,
      adminCommerceQueryKeys.products.root,
    ],
    publicAreas: VARIANT_PUBLIC_AREAS,
  });
}

export function useUpdateAdminProductVariantMutation() {
  return useAdminMutation({
    mutationFn: ({ id, request }: { id: number; request: UpdateAdminProductVariantRequest }) =>
      updateAdminProductVariant(id, request),
    invalidateKeys: () => [
      adminCommerceQueryKeys.productVariants.root,
      adminCommerceQueryKeys.products.root,
    ],
    publicAreas: VARIANT_PUBLIC_AREAS,
  });
}

export function useDeleteAdminProductVariantMutation() {
  return useAdminMutation({
    mutationFn: (id: number) => deleteAdminProductVariant(id),
    invalidateKeys: () => [
      adminCommerceQueryKeys.productVariants.root,
      adminCommerceQueryKeys.products.root,
    ],
    publicAreas: VARIANT_PUBLIC_AREAS,
  });
}

export function useAdminCouponsQuery(params: AdminCouponListParams) {
  return useQuery({
    queryKey: adminCommerceQueryKeys.coupons.list(params),
    queryFn: () => getAdminCoupons(params),
    placeholderData: keepPreviousData,
  });
}

export function useCreateAdminCouponMutation() {
  return useAdminMutation({
    mutationFn: (request: CreateAdminCouponRequest) => createAdminCoupon(request),
    invalidateKeys: () => [adminCommerceQueryKeys.coupons.root],
  });
}

export function useUpdateAdminCouponMutation() {
  return useAdminMutation({
    mutationFn: ({ id, request }: { id: number; request: UpdateAdminCouponRequest }) =>
      updateAdminCoupon(id, request),
    invalidateKeys: () => [adminCommerceQueryKeys.coupons.root],
  });
}

export function useDeleteAdminCouponMutation() {
  return useAdminMutation({
    mutationFn: (id: number) => deleteAdminCoupon(id),
    invalidateKeys: () => [adminCommerceQueryKeys.coupons.root],
  });
}

export function useUpdateAdminProductStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: ProductStatus }) =>
      updateAdminProductStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: adminCommerceQueryKeys.products.lists });
      return {
        previous: optimisticallySetStatus<AdminProduct>(
          queryClient,
          adminCommerceQueryKeys.products.lists,
          id,
          status,
        ),
      };
    },
    onError: (_error, _variables, context) => restoreAdminPages(queryClient, context?.previous),
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminCommerceQueryKeys.products.root }),
        invalidatePublicQueries(queryClient, PRODUCT_PUBLIC_AREAS),
      ]);
    },
  });
}

export function useUpdateAdminCategoryStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: AdminCatalogStatus }) =>
      updateAdminCategoryStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: adminCommerceQueryKeys.categories.lists });
      return {
        previous: optimisticallySetStatus<AdminCategory>(
          queryClient,
          adminCommerceQueryKeys.categories.lists,
          id,
          status,
        ),
      };
    },
    onError: (_error, _variables, context) => restoreAdminPages(queryClient, context?.previous),
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminCommerceQueryKeys.categories.root }),
        invalidatePublicQueries(queryClient, CATEGORY_PUBLIC_AREAS),
      ]);
    },
  });
}

export function useUpdateAdminBrandStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: AdminCatalogStatus }) =>
      updateAdminBrandStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: adminCommerceQueryKeys.brands.lists });
      return {
        previous: optimisticallySetStatus<AdminBrand>(
          queryClient,
          adminCommerceQueryKeys.brands.lists,
          id,
          status,
        ),
      };
    },
    onError: (_error, _variables, context) => restoreAdminPages(queryClient, context?.previous),
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminCommerceQueryKeys.brands.root }),
        invalidatePublicQueries(queryClient, BRAND_PUBLIC_AREAS),
      ]);
    },
  });
}

export function useUpdateAdminProductVariantStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: ProductVariantStatus }) =>
      updateAdminProductVariantStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: adminCommerceQueryKeys.productVariants.lists });
      return {
        previous: optimisticallySetStatus<AdminProductVariant>(
          queryClient,
          adminCommerceQueryKeys.productVariants.lists,
          id,
          status,
        ),
      };
    },
    onError: (_error, _variables, context) => restoreAdminPages(queryClient, context?.previous),
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminCommerceQueryKeys.productVariants.root }),
        invalidatePublicQueries(queryClient, VARIANT_PUBLIC_AREAS),
      ]);
    },
  });
}
