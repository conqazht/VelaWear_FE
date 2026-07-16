import apiClient from "@/lib/api-client";
import { apiDelete, apiGet, apiPost, apiPut, unwrapApiResponse } from "./client";
import type {
  Cart,
  Coupon,
  Gender,
  MyCoupons,
  Order,
  OrderStatusHistory,
  PageParams,
  Payment,
  ResultPaginationDTO,
  Review,
  ApiResponse,
  User,
  UserAddress,
  Wishlist,
} from "./types";

export type CreateCartRequest = {
  userId: number;
};

export type CreateWishlistRequest = {
  userId: number;
  productId: number;
};

export type CreateOrderRequest = Record<string, unknown>;
export type UpdateOrderRequest = {
  status?: string;
  shippingFee?: number;
  discountAmount?: number;
  finalAmount?: number;
  receiverName?: string;
  receiverPhone?: string;
  receiverAddress?: string;
  paymentMethod?: string;
  paymentStatus?: string;
};

export type ReplaceCartItemsRequest = {
  items: Array<{ variantId: number; quantity: number }>;
};
export type CreatePaymentRequest = Record<string, unknown>;
export type UpdatePaymentRequest = Record<string, unknown>;

type MyAddressFields = {
  receiverName: string;
  phone: string;
  province: string;
  ward: string;
  addressDetail: string;
};

export type CreateMyAddressRequest = MyAddressFields & {
  isDefault?: boolean;
};

export type UpdateMyAddressRequest = MyAddressFields & {
  isDefault: boolean;
};

export type UpdateMyProfileRequest = {
  fullName: string;
  birthDate: string;
  gender: Gender;
};

export type CreateReviewRequest = {
  orderItemId: number;
  rating: number;
  comment?: string;
  images?: File[];
};

export type CouponFilters = PageParams & {
  code?: string;
  type?: string;
  status?: string;
};

export type CommerceReviewFilters = PageParams & {
  userId?: number;
  productId?: number;
  orderId?: number;
  orderItemId?: number;
  ratingFrom?: number;
  ratingTo?: number;
};

export type OrderFilters = PageParams & {
  userId?: number;
  orderCode?: string;
  status?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  receiverName?: string;
  receiverPhone?: string;
  finalAmountFrom?: number;
  finalAmountTo?: number;
  createdFrom?: string;
  createdTo?: string;
  updatedFrom?: string;
  updatedTo?: string;
};

export type OrderStatusHistoryFilters = PageParams & {
  fromStatus?: string;
  toStatus?: string;
  changedBy?: number;
  reason?: string;
  createdFrom?: string;
  createdTo?: string;
};

export function createCart(request: CreateCartRequest) {
  return apiPost<Cart, CreateCartRequest>("/carts", request);
}

export function deleteCart(id: number) {
  return apiDelete<void>(`/carts/${id}`);
}

export function getWishlists(params: PageParams & { userId?: number } = {}) {
  return apiGet<ResultPaginationDTO<Wishlist>>("/wishlists", params);
}

export function getMyWishlists(params: PageParams = {}) {
  return apiGet<ResultPaginationDTO<Wishlist>>("/wishlists/me", params);
}

export function createWishlist(request: CreateWishlistRequest) {
  return apiPost<Wishlist, CreateWishlistRequest>("/wishlists", request);
}

export function createMyWishlist(productId: number) {
  return apiPost<Wishlist, undefined>(`/wishlists/me/${productId}`);
}

export function deleteWishlist(id: number) {
  return apiDelete<void>(`/wishlists/${id}`);
}

export function deleteMyWishlist(productId: number) {
  return apiDelete<void>(`/wishlists/me/${productId}`);
}

export function getCoupons(params: CouponFilters = {}) {
  return apiGet<ResultPaginationDTO<Coupon>>("/coupons", params);
}

export function getMyCoupons() {
  return apiGet<MyCoupons>("/coupons/me");
}

export function createOrder(request: CreateOrderRequest) {
  return apiPost<Order, CreateOrderRequest>("/orders", request);
}

export function getMyCart() {
  return apiGet<Cart>("/carts/me");
}

export function replaceMyCartItems(request: ReplaceCartItemsRequest) {
  return apiPut<Cart, ReplaceCartItemsRequest>("/carts/me/items", request);
}

export function getOrders(params: OrderFilters = {}) {
  return apiGet<ResultPaginationDTO<Order>>("/orders", params);
}

export function getMyOrders(params: PageParams = {}) {
  return apiGet<ResultPaginationDTO<Order>>("/orders/me", params);
}

export function getMyOrderByCode(orderCode: string) {
  return apiGet<Order>(`/orders/me/code/${encodeURIComponent(orderCode)}`);
}

export function getMyOrderById(id: number) {
  return apiGet<Order>(`/orders/me/${id}`);
}

export function getMyOrderStatusHistories(
  id: number,
  params: OrderStatusHistoryFilters = {}
) {
  return apiGet<ResultPaginationDTO<OrderStatusHistory>>(
    `/orders/me/${id}/status-histories`,
    params
  );
}

export function updateOrder(id: number, request: UpdateOrderRequest) {
  return apiPut<Order, UpdateOrderRequest>(`/orders/${id}`, request);
}

export function deleteOrder(id: number) {
  return apiDelete<void>(`/orders/${id}`);
}

export function createPayment(request: CreatePaymentRequest) {
  return apiPost<Payment, CreatePaymentRequest>("/payments", request);
}

export function updatePayment(id: number, request: UpdatePaymentRequest) {
  return apiPut<Payment, UpdatePaymentRequest>(`/payments/${id}`, request);
}

export function getUsers(params: PageParams = {}) {
  return apiGet<ResultPaginationDTO<User>>("/users", params);
}

export function updateMyProfile(request: UpdateMyProfileRequest) {
  return apiPut<User, UpdateMyProfileRequest>("/users/me", {
    fullName: request.fullName,
    birthDate: request.birthDate,
    gender: request.gender,
  });
}

export function getMyAddresses(params: PageParams = {}) {
  return apiGet<ResultPaginationDTO<UserAddress>>("/user-addresses/me", params);
}

export function getMyAddressById(id: number) {
  return apiGet<UserAddress>(`/user-addresses/me/${id}`);
}

function toMyAddressBody(request: CreateMyAddressRequest | UpdateMyAddressRequest) {
  return {
    receiverName: request.receiverName,
    phone: request.phone,
    province: request.province,
    ward: request.ward,
    addressDetail: request.addressDetail,
    isDefault: request.isDefault ?? false,
  };
}

export function createMyAddress(request: CreateMyAddressRequest) {
  return apiPost<UserAddress, CreateMyAddressRequest>(
    "/user-addresses/me",
    toMyAddressBody(request),
  );
}

export function updateMyAddress(id: number, request: UpdateMyAddressRequest) {
  return apiPut<UserAddress, UpdateMyAddressRequest>(
    `/user-addresses/me/${id}`,
    toMyAddressBody(request),
  );
}

export function deleteMyAddress(id: number) {
  return apiDelete<void>(`/user-addresses/me/${id}`);
}

export function getCommerceReviews(params: CommerceReviewFilters = {}) {
  return apiGet<ResultPaginationDTO<Review>>("/reviews", params);
}

export function getMyReviews(params: PageParams & { orderId?: number } = {}) {
  return apiGet<ResultPaginationDTO<Review>>("/reviews/me", params);
}

export function createReview(request: CreateReviewRequest) {
  const formData = new FormData();
  formData.append(
    "review",
    new Blob(
      [JSON.stringify({
        orderItemId: request.orderItemId,
        rating: request.rating,
        comment: request.comment?.trim() || null,
      })],
      { type: "application/json" },
    ),
  );
  request.images?.forEach((image) => formData.append("images", image));

  return apiClient
    // Axios/the browser must set the multipart boundary; forcing Content-Type here
    // can produce a request Spring cannot parse.
    .post<ApiResponse<Review>>("/reviews", formData)
    .then(unwrapApiResponse);
}
