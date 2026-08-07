"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createOrder,
  createPayment,
  createReview,
  createMyAddress,
  createMyWishlist,
  deleteMyAddress,
  deleteMyWishlist,
  getCoupons,
  getMyAddresses,
  getMyCart,
  getMyCoupons,
  getMyOrders,
  getMyReviews,
  getMyWishlists,
  updateMyAddress,
  updateMyProfile,
  type CouponFilters,
  type CreateMyAddressRequest,
  type CreateOrderRequest,
  type CreatePaymentRequest,
  type CreateReviewRequest,
  type UpdateMyAddressRequest,
  type UpdateMyProfileRequest,
} from "@/lib/api/commerce";
import type { PageParams } from "@/lib/api/types";
import { queryKeys } from "./keys";

export function useMyCartQuery(accountId?: number) {
  return useQuery({
    queryKey: queryKeys.cart.me(accountId),
    queryFn: getMyCart,
    enabled: typeof accountId === "number",
  });
}

export function useWishlistsQuery(
  userId: number | undefined,
  params: PageParams = {},
  enabled = true,
  locale?: string
) {
  return useQuery({
    queryKey: queryKeys.wishlists.list(userId, params, locale),
    queryFn: () => getMyWishlists(params),
    enabled: enabled && typeof userId === "number",
  });
}

export function useCouponsQuery(params: CouponFilters = {}, enabled = true) {
  return useQuery({
    queryKey: queryKeys.coupons.list(params),
    queryFn: () => getCoupons(params),
    enabled,
  });
}

export function useMyCouponsQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.coupons.my,
    queryFn: getMyCoupons,
    enabled,
  });
}

export function useCreateWishlistMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: number) => createMyWishlist(productId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.wishlists.root });
    },
  });
}

export function useDeleteWishlistMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: number) => deleteMyWishlist(productId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.wishlists.root });
    },
  });
}

export function useCreateOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateOrderRequest) => createOrder(request),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.orders.root }),
        queryClient.invalidateQueries({ queryKey: queryKeys.cart.root }),
        queryClient.invalidateQueries({ queryKey: queryKeys.payments.root }),
      ]);
    },
  });
}

export function useCreatePaymentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreatePaymentRequest) => createPayment(request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.payments.root });
    },
  });
}

export function useMyOrdersQuery(
  accountId?: number,
  params: PageParams = {},
  enabled = true
) {
  return useQuery({
    queryKey: queryKeys.orders.meList(accountId, params),
    queryFn: () => getMyOrders(params),
    enabled: enabled && typeof accountId === "number",
  });
}

export function useMyReviewsQuery(
  enabled: boolean,
  params: PageParams & { orderId?: number } = {},
) {
  return useQuery({
    queryKey: queryKeys.reviews.me(params),
    queryFn: () => getMyReviews(params),
    enabled,
  });
}

export function useMyAddressesQuery(
  accountId?: number,
  params: PageParams = {},
  enabled = true
) {
  return useQuery({
    queryKey: queryKeys.addresses.meList(accountId, params),
    queryFn: () => getMyAddresses(params),
    enabled: enabled && typeof accountId === "number",
  });
}

export function useCreateMyAddressMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateMyAddressRequest) => createMyAddress(request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.addresses.root });
    },
  });
}

export function useUpdateMyAddressMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      request,
    }: {
      id: number;
      request: UpdateMyAddressRequest;
    }) => updateMyAddress(id, request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.addresses.root });
    },
  });
}

export function useDeleteMyAddressMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteMyAddress(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.addresses.root });
    },
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateMyProfileRequest) => updateMyProfile(request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.root });
    },
  });
}

export function useCreateReviewMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateReviewRequest) => createReview(request),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.reviews.root }),
        queryClient.invalidateQueries({ queryKey: queryKeys.orders.root }),
        queryClient.invalidateQueries({ queryKey: queryKeys.products.root }),
      ]);
    },
  });
}
