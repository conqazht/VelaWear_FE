import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api/client";

export type AdminPagination = {
  page: number;
  pageSize: number;
  pages: number;
  total: number;
};

export type AdminPage<T> = {
  meta: AdminPagination;
  result: T[];
};

export type AdminPageParams = {
  page?: number;
  size?: number;
  sort?: string;
};

export type ProductStatus = "DRAFT" | "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK";

export type AdminProduct = {
  id: number;
  categoryId: number;
  brandId: number;
  name: string;
  slug: string;
  originalSlug: string;
  shortDescription: string | null;
  description: string | null;
  material: string | null;
  careInstruction: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
  image: string | null;
  thumbnail: string | null;
  images: string[];
  categoryName: string | null;
  categorySlug: string | null;
  price: number | null;
  salePrice: number | null;
};

export type AdminProductListParams = AdminPageParams & {
  categoryId?: number;
  brandId?: number;
  name?: string;
  slug?: string;
  status?: ProductStatus;
  global?: boolean;
  createdFrom?: string;
  createdTo?: string;
  colorId?: number;
  sizeId?: number;
  minPrice?: number;
  maxPrice?: number;
  locale?: string;
};

export type CreateAdminProductRequest = {
  categoryId: number;
  brandId: number;
  name: string;
  slug: string;
  description: string | null;
  status: ProductStatus;
};

export type UpdateAdminProductRequest = Omit<CreateAdminProductRequest, "slug">;

export type AdminCatalogOption = {
  id: number;
  name: string;
  slug?: string | null;
  status?: string;
};

export type AdminCatalogStatus = "ACTIVE" | "INACTIVE";

export type AdminCategory = {
  id: number;
  parentId: number | null;
  name: string;
  slug: string;
  originalSlug: string;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  sortOrder: number;
  status: AdminCatalogStatus;
  createdAt: string;
  updatedAt: string;
};

export type AdminCategoryListParams = AdminPageParams & {
  parentId?: number;
  name?: string;
  slug?: string;
  status?: AdminCatalogStatus;
  global?: boolean;
  createdFrom?: string;
  createdTo?: string;
  locale?: string;
};

export type CreateAdminCategoryRequest = {
  parentId: number | null;
  name: string;
  slug: string;
  sortOrder: number;
  status: AdminCatalogStatus;
};

export type UpdateAdminCategoryRequest = Omit<CreateAdminCategoryRequest, "slug">;

export type AdminBrand = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  status: AdminCatalogStatus;
  createdAt: string;
  updatedAt: string;
};

export type AdminBrandListParams = AdminPageParams & {
  name?: string;
  slug?: string;
  status?: AdminCatalogStatus;
  createdFrom?: string;
  createdTo?: string;
};

export type CreateAdminBrandRequest = {
  name: string;
  slug: string;
  description: string | null;
  status?: AdminCatalogStatus;
};

export type UpdateAdminBrandRequest = Omit<CreateAdminBrandRequest, "slug" | "status"> & {
  status: AdminCatalogStatus;
};

export type AdminColor = {
  id: number;
  name: string;
  hexCode: string | null;
  sortOrder: number | null;
};

export type AdminColorListParams = AdminPageParams & {
  name?: string;
  hexCode?: string;
};

export type CreateAdminColorRequest = {
  name: string;
  hexCode: string | null;
  sortOrder: number | null;
};

export type UpdateAdminColorRequest = CreateAdminColorRequest;

export type AdminSize = {
  id: number;
  name: string;
  sortOrder: number | null;
};

export type AdminSizeListParams = AdminPageParams & {
  name?: string;
};

export type CreateAdminSizeRequest = {
  name: string;
  sortOrder: number | null;
};

export type UpdateAdminSizeRequest = CreateAdminSizeRequest;

export type ProductVariantStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "OUT_OF_STOCK"
  | "DISCONTINUED";

export type AdminProductVariantReference = {
  id: number;
  name: string;
};

export type AdminProductVariant = {
  id: number;
  product: AdminProductVariantReference;
  sku: string;
  price: number;
  salePrice: number | null;
  stockQuantity: number;
  color: AdminProductVariantReference | null;
  size: AdminProductVariantReference | null;
  status: ProductVariantStatus;
  createdAt: string;
  updatedAt: string;
};

export type AdminProductVariantListParams = AdminPageParams & {
  productId?: number;
  colorId?: number;
  sizeId?: number;
  sku?: string;
  status?: ProductVariantStatus;
  priceFrom?: number;
  priceTo?: number;
  salePriceFrom?: number;
  salePriceTo?: number;
  stockFrom?: number;
  stockTo?: number;
  createdFrom?: string;
  createdTo?: string;
};

export type CreateAdminProductVariantRequest = {
  productId: number;
  sku: string;
  price: number;
  salePrice: number | null;
  stockQuantity: number | null;
  colorId: number | null;
  sizeId: number | null;
  status?: ProductVariantStatus;
};

export type UpdateAdminProductVariantRequest = Omit<
  CreateAdminProductVariantRequest,
  "status"
> & {
  status: ProductVariantStatus;
};

export type CouponType = "PERCENTAGE" | "FIXED_AMOUNT";
export type CouponStatus = "ACTIVE" | "INACTIVE" | "EXPIRED";

export type AdminCoupon = {
  id: number;
  code: string;
  type: CouponType;
  value: number;
  minOrderAmount: number;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  startDate: string;
  endDate: string;
  status: CouponStatus;
};

export type AdminCouponListParams = AdminPageParams & {
  code?: string;
  type?: CouponType;
  status?: CouponStatus;
  valueFrom?: number;
  valueTo?: number;
  minOrderAmountFrom?: number;
  minOrderAmountTo?: number;
  maxDiscountFrom?: number;
  maxDiscountTo?: number;
  usageLimitFrom?: number;
  usageLimitTo?: number;
  usedCountFrom?: number;
  usedCountTo?: number;
  startFrom?: string;
  startTo?: string;
  endFrom?: string;
  endTo?: string;
};

export type CreateAdminCouponRequest = {
  code: string;
  type: CouponType;
  value: number;
  minOrderAmount: number;
  maxDiscount: number | null;
  usageLimit: number | null;
  startDate: string;
  endDate: string;
  status: CouponStatus;
};

export type UpdateAdminCouponRequest = Omit<CreateAdminCouponRequest, "code">;

export function getAdminProducts(params: AdminProductListParams = {}) {
  return apiGet<AdminPage<AdminProduct>>("/products", { ...params });
}

export function getAdminProduct(id: number) {
  return apiGet<AdminProduct>(`/products/${id}`);
}

export function createAdminProduct(request: CreateAdminProductRequest) {
  return apiPost<AdminProduct, CreateAdminProductRequest>("/products", request);
}

export function updateAdminProduct(id: number, request: UpdateAdminProductRequest) {
  return apiPut<AdminProduct, UpdateAdminProductRequest>(`/products/${id}`, request);
}

export function deleteAdminProduct(id: number) {
  return apiDelete<void>(`/products/${id}`);
}

export function getAdminCategories(params: AdminCategoryListParams = {}) {
  return apiGet<AdminPage<AdminCategory>>("/categories", { ...params });
}

export function getAdminCategory(id: number, locale?: string) {
  return apiGet<AdminCategory>(`/categories/${id}`, { locale });
}

export function createAdminCategory(request: CreateAdminCategoryRequest) {
  return apiPost<AdminCategory, CreateAdminCategoryRequest>("/categories", request);
}

export function updateAdminCategory(id: number, request: UpdateAdminCategoryRequest) {
  return apiPut<AdminCategory, UpdateAdminCategoryRequest>(`/categories/${id}`, request);
}

export function deleteAdminCategory(id: number) {
  return apiDelete<void>(`/categories/${id}`);
}

export function getAdminBrands(params: AdminBrandListParams = {}) {
  return apiGet<AdminPage<AdminBrand>>("/brands", { ...params });
}

export function getAdminBrand(id: number) {
  return apiGet<AdminBrand>(`/brands/${id}`);
}

export function createAdminBrand(request: CreateAdminBrandRequest) {
  return apiPost<AdminBrand, CreateAdminBrandRequest>("/brands", request);
}

export function updateAdminBrand(id: number, request: UpdateAdminBrandRequest) {
  return apiPut<AdminBrand, UpdateAdminBrandRequest>(`/brands/${id}`, request);
}

export function deleteAdminBrand(id: number) {
  return apiDelete<void>(`/brands/${id}`);
}

export function getAdminColors(params: AdminColorListParams = {}) {
  return apiGet<AdminPage<AdminColor>>("/colors", { ...params });
}

export function getAdminColor(id: number) {
  return apiGet<AdminColor>(`/colors/${id}`);
}

export function createAdminColor(request: CreateAdminColorRequest) {
  return apiPost<AdminColor, CreateAdminColorRequest>("/colors", request);
}

export function updateAdminColor(id: number, request: UpdateAdminColorRequest) {
  return apiPut<AdminColor, UpdateAdminColorRequest>(`/colors/${id}`, request);
}

export function deleteAdminColor(id: number) {
  return apiDelete<void>(`/colors/${id}`);
}

export function getAdminSizes(params: AdminSizeListParams = {}) {
  return apiGet<AdminPage<AdminSize>>("/sizes", { ...params });
}

export function getAdminSize(id: number) {
  return apiGet<AdminSize>(`/sizes/${id}`);
}

export function createAdminSize(request: CreateAdminSizeRequest) {
  return apiPost<AdminSize, CreateAdminSizeRequest>("/sizes", request);
}

export function updateAdminSize(id: number, request: UpdateAdminSizeRequest) {
  return apiPut<AdminSize, UpdateAdminSizeRequest>(`/sizes/${id}`, request);
}

export function deleteAdminSize(id: number) {
  return apiDelete<void>(`/sizes/${id}`);
}

export function getAdminProductVariants(params: AdminProductVariantListParams = {}) {
  return apiGet<AdminPage<AdminProductVariant>>("/product-variants", { ...params });
}

export function getAdminProductVariant(id: number) {
  return apiGet<AdminProductVariant>(`/product-variants/${id}`);
}

export function createAdminProductVariant(request: CreateAdminProductVariantRequest) {
  return apiPost<AdminProductVariant, CreateAdminProductVariantRequest>(
    "/product-variants",
    request
  );
}

export function updateAdminProductVariant(
  id: number,
  request: UpdateAdminProductVariantRequest
) {
  return apiPut<AdminProductVariant, UpdateAdminProductVariantRequest>(
    `/product-variants/${id}`,
    request
  );
}

export function deleteAdminProductVariant(id: number) {
  return apiDelete<void>(`/product-variants/${id}`);
}

export function getAdminCoupons(params: AdminCouponListParams = {}) {
  return apiGet<AdminPage<AdminCoupon>>("/coupons", { ...params });
}

export function getAdminCoupon(id: number) {
  return apiGet<AdminCoupon>(`/coupons/${id}`);
}

export function createAdminCoupon(request: CreateAdminCouponRequest) {
  return apiPost<AdminCoupon, CreateAdminCouponRequest>("/coupons", request);
}

export function updateAdminCoupon(id: number, request: UpdateAdminCouponRequest) {
  return apiPut<AdminCoupon, UpdateAdminCouponRequest>(`/coupons/${id}`, request);
}

export function deleteAdminCoupon(id: number) {
  return apiDelete<void>(`/coupons/${id}`);
}
