import { apiDelete, apiGet, apiPost, apiPut } from "./client";
import type {
  Cart,
  Coupon,
  MyCoupons,
  Order,
  OrderStatusHistory,
  PageParams,
  Payment,
  ResultPaginationDTO,
  Review,
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

export type CreateUserAddressRequest = {
  userId: number;
  receiverName: string;
  phone: string;
  province: string;
  ward: string;
  addressDetail: string;
  isDefault?: boolean;
};

export type UpdateUserAddressRequest = Partial<CreateUserAddressRequest>;

export type CreateReviewRequest = {
  userId: number;
  orderItemId: number;
  rating: number;
  content?: string;
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

export function getCartByUser(userId: number) {
  return apiGet<Cart>(`/carts/user/${userId}`);
}

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

export function getOrdersByUser(userId: number, params: PageParams = {}) {
  return apiGet<ResultPaginationDTO<Order>>(`/orders/user/${userId}`, params);
}

export function getOrderByCode(orderCode: string) {
  return apiGet<Order>(`/orders/code/${orderCode}`);
}

export function getOrderById(id: number) {
  return apiGet<Order>(`/orders/${id}`);
}

export function getOrderStatusHistories(
  id: number,
  params: OrderStatusHistoryFilters = {}
) {
  return apiGet<ResultPaginationDTO<OrderStatusHistory>>(
    `/orders/${id}/status-histories`,
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

export function getUser(id: number) {
  return apiGet<User>(`/users/${id}`);
}

export function updateUser(id: number, request: Partial<User>) {
  return apiPut<User, Partial<User>>(`/users/${id}`, request);
}

export function getUserAddresses(params: PageParams & { userId?: number } = {}) {
  return apiGet<ResultPaginationDTO<UserAddress>>("/user-addresses", params);
}

export function createUserAddress(request: CreateUserAddressRequest) {
  return apiPost<UserAddress, CreateUserAddressRequest>("/user-addresses", request);
}

export function updateUserAddress(id: number, request: UpdateUserAddressRequest) {
  return apiPut<UserAddress, UpdateUserAddressRequest>(
    `/user-addresses/${id}`,
    request
  );
}

export function deleteUserAddress(id: number) {
  return apiDelete<void>(`/user-addresses/${id}`);
}

export function getCommerceReviews(params: CommerceReviewFilters = {}) {
  return apiGet<ResultPaginationDTO<Review>>("/reviews", params);
}

export function getReviewsByUser(userId: number, params: PageParams = {}) {
  return apiGet<ResultPaginationDTO<Review>>(`/reviews/user/${userId}`, params);
}

export function createReview(request: CreateReviewRequest) {
  return apiPost<Review, CreateReviewRequest>("/reviews", request);
}
