"use client";

import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/components/providers/i18n-provider";
import {
  getBrands,
  getCategories,
  getColors,
  getProduct,
  getProductReviews,
  getProductReviewSummary,
  getProducts,
  getStorefrontProducts,
  getProductVariants,
  getSizes,
  type ProductFilters,
  type ProductVariantFilters,
  type ReviewFilters,
} from "@/lib/api/catalog";
import type { PageParams, StorefrontCatalogFilters } from "@/lib/api/types";
import { queryKeys } from "./keys";

export function useProductsQuery(filters: ProductFilters = {}) {
  const { locale } = useI18n();

  return useQuery({
    queryKey: queryKeys.products.list(filters, locale),
    queryFn: () => getProducts(filters),
    placeholderData: (previousData, previousQuery) =>
      previousQuery?.queryKey[2] === locale ? previousData : undefined,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useStorefrontProductsQuery(
  filters: StorefrontCatalogFilters = {},
  options: { enabled?: boolean } = {},
) {
  const { locale } = useI18n();
  const localizedFilters = { ...filters, locale: filters.locale ?? locale };

  return useQuery({
    queryKey: queryKeys.storefrontCatalog.list(localizedFilters, locale),
    queryFn: () => getStorefrontProducts(localizedFilters),
    enabled: options.enabled ?? true,
    placeholderData: (previousData, previousQuery) =>
      previousQuery?.queryKey[2] === locale ? previousData : undefined,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}

export function useProductQuery(id: number | string, localeOverride?: string) {
  const { locale } = useI18n();
  const resolvedLocale = localeOverride ?? locale;

  return useQuery({
    queryKey: queryKeys.products.detail(id, resolvedLocale),
    queryFn: () => getProduct(id, resolvedLocale),
    enabled: Boolean(id),
    staleTime: 5_000,
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
  });
}

export function useCategoriesQuery(params: PageParams = {}) {
  const { locale } = useI18n();

  return useQuery({
    queryKey: queryKeys.catalog.categories(params, locale),
    queryFn: () => getCategories(params),
  });
}

export function useBrandsQuery(params: PageParams = {}) {
  return useQuery({
    queryKey: queryKeys.catalog.brands(params),
    queryFn: () => getBrands(params),
  });
}

export function useColorsQuery(params: PageParams = {}) {
  return useQuery({
    queryKey: queryKeys.catalog.colors(params),
    queryFn: () => getColors(params),
  });
}

export function useSizesQuery(params: PageParams = {}) {
  return useQuery({
    queryKey: queryKeys.catalog.sizes(params),
    queryFn: () => getSizes(params),
  });
}

export function useProductVariantsQuery(params: ProductVariantFilters = {}) {
  return useQuery({
    queryKey: queryKeys.catalog.variants(params),
    queryFn: () => getProductVariants(params),
    enabled: params.productId === undefined || Boolean(params.productId),
    staleTime: 5_000,
    refetchInterval: params.productId ? 15_000 : false,
    refetchOnWindowFocus: true,
  });
}

export function useProductReviewsQuery(
  params: ReviewFilters = {},
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: queryKeys.reviews.product(params.productId as number, params),
    queryFn: () => getProductReviews(params.productId as number, params),
    enabled: Boolean(params.productId) && (options.enabled ?? true),
  });
}

export function useProductReviewSummaryQuery(
  productId?: number,
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: queryKeys.reviews.summary(productId as number),
    queryFn: () => getProductReviewSummary(productId as number),
    enabled: Boolean(productId) && (options.enabled ?? true),
  });
}
