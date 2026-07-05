import { apiDelete, apiGet, apiPost, apiPut } from "./client";
import type {
  Cart,
  Order,
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
export type UpdateOrderRequest = Record<string, unknown>;
export type CreatePaymentRequest = Record<string, unknown>;
export type UpdatePaymentRequest = Record<string, unknown>;

export type CreateUserAddressRequest = {
  userId: number;
  receiverName: string;
  receiverPhone: string;
  addressLine: string;
  isDefault?: boolean;
};

export type UpdateUserAddressRequest = Partial<CreateUserAddressRequest>;

export type CreateReviewRequest = {
  userId: number;
  orderItemId: number;
  rating: number;
  content?: string;
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

export function createWishlist(request: CreateWishlistRequest) {
  return apiPost<Wishlist, CreateWishlistRequest>("/wishlists", request);
}

export function deleteWishlist(id: number) {
  return apiDelete<void>(`/wishlists/${id}`);
}

export function createOrder(request: CreateOrderRequest) {
  return apiPost<Order, CreateOrderRequest>("/orders", request);
}

export function getOrdersByUser(userId: number, params: PageParams = {}) {
  return apiGet<ResultPaginationDTO<Order>>(`/orders/user/${userId}`, params);
}

export function getOrderByCode(orderCode: string) {
  return apiGet<Order>(`/orders/code/${orderCode}`);
}

export function updateOrder(id: number, request: UpdateOrderRequest) {
  return apiPut<Order, UpdateOrderRequest>(`/orders/${id}`, request);
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

export function createReview(request: CreateReviewRequest) {
  return apiPost<Review, CreateReviewRequest>("/reviews", request);
}
