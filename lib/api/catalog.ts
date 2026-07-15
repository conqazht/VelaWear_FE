import { apiGet } from "./client";
import { serverApiGet } from "./server";
import type {
  CatalogEntity,
  PageParams,
  Product,
  ProductVariant,
  ResultPaginationDTO,
  Review,
} from "./types";

export type ProductFilters = PageParams & {
  keyword?: string;
  name?: string;
  slug?: string;
  locale?: string;
  categoryId?: number;
  brandId?: number;
  colorId?: number;
  sizeId?: number;
  minPrice?: number;
  maxPrice?: number;
};

export type ProductVariantFilters = PageParams & {
  productId?: number;
};

export function getProducts(filters: ProductFilters = {}) {
  return apiGet<ResultPaginationDTO<Product>>("/products", filters);
}

export function getProduct(id: number | string, locale?: string) {
  return apiGet<Product>(`/products/${id}`, { locale });
}

export function getCategories(params: PageParams = {}) {
  return apiGet<ResultPaginationDTO<CatalogEntity>>("/categories", params);
}

export function getBrands(params: PageParams = {}) {
  return apiGet<ResultPaginationDTO<CatalogEntity>>("/brands", params);
}

export function getColors(params: PageParams = {}) {
  return apiGet<ResultPaginationDTO<CatalogEntity>>("/colors", params);
}

export function getSizes(params: PageParams = {}) {
  return apiGet<ResultPaginationDTO<CatalogEntity>>("/sizes", params);
}

export function getProductVariants(params: ProductVariantFilters = {}) {
  return apiGet<ResultPaginationDTO<ProductVariant>>("/product-variants", params);
}

export function getProductsForRender(filters: ProductFilters = {}) {
  return serverApiGet<ResultPaginationDTO<Product>>("/products", {
    query: filters,
    next: { revalidate: 300 },
  });
}

export function getProductForRender(id: number | string, locale?: string) {
  return serverApiGet<Product>(`/products/${id}`, {
    query: { locale },
    next: { revalidate: 300 },
  });
}

export type ReviewFilters = PageParams & {
  productId?: number;
  userId?: number;
  orderId?: number;
  orderItemId?: number;
};

export function getReviews(filters: ReviewFilters = {}) {
  return apiGet<ResultPaginationDTO<Review>>("/reviews", filters);
}

export function getProductReviews(productId: number, filters: ReviewFilters = {}) {
  return apiGet<ResultPaginationDTO<Review>>(`/reviews/product/${productId}`, {
    ...filters,
    productId: undefined,
  });
}
