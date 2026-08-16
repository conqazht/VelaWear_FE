export type ApiResponse<T> = {
  statusCode: number;
  message: string;
  data: T;
  code?: string;
  error?: string;
  timestamp?: string;
};

export type ResultPaginationDTO<T> = {
  meta: {
    page: number;
    pageSize: number;
    pages: number;
    total: number;
  };
  result: T[];
};

export type PageParams = {
  page?: number;
  size?: number;
  sort?: string;
  locale?: string;
};

export type Id = number | string;

export type SaleCampaignType = "STANDARD" | "FLASH";
export type SaleCampaignStatus = "DRAFT" | "PUBLISHED" | "CANCELLED";
export type SaleCampaignPhase = "UPCOMING" | "LIVE" | "ENDED";
export type PriceSource = "BASE" | "STANDARD_SALE" | "FLASH_SALE";

export type Pricing = {
  listPrice: number;
  effectivePrice: number;
  priceSource: PriceSource;
  campaignId?: number | null;
  campaignItemId?: number | null;
  campaignCode?: string | null;
  campaignName?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  remainingQuota?: number | null;
  maxPerCustomer?: number | null;
  customerRemaining?: number | null;
  couponEligible?: boolean;
  availableQuantity?: number | null;
};

export type Gender = "MALE" | "FEMALE" | "OTHER";

export type User = {
  id: number;
  email: string;
  fullName: string;
  birthDate: string | null;
  avatar: string | null;
  gender: Gender | null;
  createdAt: string;
  updatedAt: string;
  hasPassword: boolean;
  roles?: Array<{
    id: number;
    name: string;
  }>;
};

export type ProductColorImages = {
  colorId: number;
  colorName: string;
  hexCode?: string | null;
  thumbnail?: string | null;
  images: string[];
};

export type Product = {
  id: number;
  brandId?: number | null;
  categoryId: number;
  name: string;
  slug: string;
  originalSlug?: string;
  description: string;
  price?: number | null;
  pricing?: Pricing | null;
  thumbnail?: string | null;
  image?: string | null;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  images?: string[];
  colorImages?: ProductColorImages[];
  categoryName?: string | null;
  categorySlug?: string | null;
};

export type StorefrontCatalogSort = "featured" | "newest" | "price-asc" | "price-desc";

export type StorefrontCatalogFilters = {
  q?: string;
  categorySlugs?: string[];
  colorIds?: number[];
  sizeIds?: number[];
  minPrice?: number;
  maxPrice?: number;
  sort?: StorefrontCatalogSort;
  page?: number;
  size?: number;
  locale?: string;
};

export type StorefrontCategoryFacet = {
  id: number;
  name: string;
  slug: string;
  count: number;
};

export type StorefrontColorFacet = {
  id: number;
  name: string;
  hexCode?: string | null;
  sortOrder?: number | null;
  count: number;
};

export type StorefrontSizeFacet = {
  id: number;
  name: string;
  sortOrder?: number | null;
  count: number;
};

export type StorefrontCatalogResult = ResultPaginationDTO<Product> & {
  facets: {
    categories: StorefrontCategoryFacet[];
    colors: StorefrontColorFacet[];
    sizes: StorefrontSizeFacet[];
    priceRange: {
      min: number | null;
      max: number | null;
    };
  };
};

export type CatalogEntity = {
  id: number;
  name: string;
  slug?: string;
  code?: string;
  hexCode?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ProductVariant = {
  id: number;
  product: Pick<CatalogEntity, "id" | "name"> | null;
  sku: string;
  price: number;
  pricing?: Pricing | null;
  stockQuantity: number;
  status: string;
  color: CatalogEntity | null;
  size: CatalogEntity | null;
  createdAt?: string;
  updatedAt?: string;
};

export type SaleCampaignItem = {
  id: number;
  campaignId?: number;
  variantId: number;
  productId: number;
  productName: string;
  productSlug?: string | null;
  sku: string;
  image?: string | null;
  color?: string | null;
  size?: string | null;
  referencePrice: number;
  promotionalPrice: number;
  stockQuantity: number;
  availableQuantity: number;
  quota?: number | null;
  reservedQuantity?: number | null;
  soldQuantity?: number | null;
  remainingQuota?: number | null;
  maxPerCustomer?: number | null;
};

export type SaleCampaign = {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  bannerUrl?: string | null;
  type: SaleCampaignType;
  status: SaleCampaignStatus;
  phase: SaleCampaignPhase;
  startsAt: string;
  endsAt: string;
  version?: number;
  translationLocales?: Array<"en" | "vi">;
  items: SaleCampaignItem[];
};

export type PublicSalesResult = {
  serverTime: string;
  campaigns: SaleCampaign[];
};

export type CartApiItem = {
  id: number;
  variantId: number;
  productId?: number | null;
  productSlug?: string | null;
  productName: string;
  image?: string | null;
  sku?: string | null;
  color?: string | null;
  size?: string | null;
  price: number;
  listPrice?: number;
  pricing?: Pricing | null;
  priceSource?: PriceSource;
  campaignId?: number | null;
  campaignItemId?: number | null;
  campaignCode?: string | null;
  campaignName?: string | null;
  campaignEndsAt?: string | null;
  remainingQuota?: number | null;
  maxPerCustomer?: number | null;
  customerRemaining?: number | null;
  availableQuantity?: number | null;
  quantity: number;
};

export type Cart = {
  id: number;
  userId?: number;
  items: CartApiItem[];
  createdAt?: string;
  updatedAt?: string;
};

export type WishlistProductSummary = {
  id: number;
  slug: string;
  name: string;
  description: string;
  categoryId: number;
  originalSlug?: string;
  shortDescription?: string;
  status: string;
  image?: string | null;
  thumbnail?: string | null;
  categoryName?: string | null;
  categorySlug?: string | null;
  price: number;
  pricing?: Pricing | null;
};

export type Wishlist = {
  id: number;
  userId: number;
  productId: number;
  product: WishlistProductSummary;
  createdAt?: string;
};

export type Order = {
  id: number;
  userId?: number;
  userFullName?: string;
  userEmail?: string;
  orderCode: string;
  status: string;
  subtotal?: number;
  shippingFee?: number;
  discountAmount?: number;
  finalAmount?: number;
  receiverName?: string;
  receiverPhone?: string;
  receiverAddress?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  paymentDueAt?: string | null;
  reservationExpiresAt?: string | null;
  resourcesReleasedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  items?: OrderItem[];
};

export type OrderItem = {
  id: number;
  variantId?: number | null;
  productName: string;
  productSlug?: string | null;
  variantName?: string | null;
  sku: string;
  image?: string | null;
  price: number;
  listPrice?: number;
  priceSource?: PriceSource;
  saleCampaignItemId?: number | null;
  saleCampaignCode?: string | null;
  saleCampaignName?: string | null;
  quantity: number;
  subtotal: number;
  status: string;
  createdAt?: string;
};

export type OrderStatusHistory = {
  id: number;
  orderId: number;
  fromStatus?: string | null;
  toStatus: string;
  changedBy?: number | null;
  reason?: string | null;
  createdAt: string;
};

export type Payment = {
  id: number;
  orderId: number;
  paymentMethod: string;
  paymentStatus?: string;
  amount?: number;
};

export type UserAddress = {
  id: number;
  userId: number;
  receiverName: string;
  phone: string;
  province: string;
  ward: string;
  addressDetail: string;
  isDefault: boolean;
};

export type Coupon = {
  id: number;
  code: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT" | string;
  value: number;
  minOrderAmount?: number | null;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  usedCount: number;
  startDate?: string | null;
  endDate?: string | null;
  status: "ACTIVE" | "INACTIVE" | "EXPIRED" | string;
};

export type CouponUsage = {
  id: number;
  coupon: Coupon;
  orderId: number;
  orderCode: string;
  discountAmount: number;
  usedAt: string;
};

export type MyCoupons = {
  availableCoupons: Coupon[];
  usageHistory: CouponUsage[];
};

export type Review = {
  id: number;
  userId?: number;
  userName: string;
  orderId?: number;
  orderCode?: string;
  orderItemId?: number;
  productName: string;
  productId?: number | null;
  productSlug?: string | null;
  variantName?: string | null;
  rating: number;
  comment?: string | null;
  images?: string[];
  verifiedPurchase?: boolean;
  createdAt?: string;
};

export type ReviewSummary = {
  total: number;
  averageRating: number;
  ratingCounts: Record<"1" | "2" | "3" | "4" | "5", number>;
};
