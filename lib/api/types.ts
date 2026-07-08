export type ApiResponse<T> = {
  statusCode: number;
  message: string;
  data: T;
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
  roles?: unknown;
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
  salePrice?: number | null;
  thumbnail?: string | null;
  image?: string | null;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  images?: string[];
  categoryName?: string | null;
  categorySlug?: string | null;
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
  productId?: number;
  sku?: string;
  price?: number;
  salePrice?: number | null;
  stockQuantity?: number;
  color?: CatalogEntity | null;
  size?: CatalogEntity | null;
};

export type Cart = {
  id: number;
  userId?: number;
  items?: unknown[];
  createdAt?: string;
  updatedAt?: string;
};

export type Wishlist = {
  id: number;
  userId: number;
  productId: number;
  product?: Product;
  createdAt?: string;
};

export type Order = {
  id: number;
  orderCode: string;
  status: string;
  finalAmount?: number;
  createdAt?: string;
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
  receiverPhone: string;
  addressLine: string;
  isDefault?: boolean;
};

export type Review = {
  id: number;
  userId: number;
  userName: string;
  orderId: number;
  orderCode: string;
  orderItemId: number;
  productName: string;
  rating: number;
  comment?: string | null;
  createdAt?: string;
};
