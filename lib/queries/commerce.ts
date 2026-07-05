"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createOrder,
  createPayment,
  createReview,
  createUserAddress,
  createWishlist,
  deleteUserAddress,
  deleteWishlist,
  getCartByUser,
  getOrderByCode,
  getOrdersByUser,
  getUserAddresses,
  getWishlists,
  updateUser,
  updateUserAddress,
  type CreateOrderRequest,
  type CreatePaymentRequest,
  type CreateReviewRequest,
  type CreateUserAddressRequest,
  type CreateWishlistRequest,
  type UpdateUserAddressRequest,
} from "@/lib/api/commerce";
import type { PageParams, User } from "@/lib/api/types";
import { queryKeys } from "./keys";

export function useUserCartQuery(userId?: number) {
  return useQuery({
    queryKey: userId ? queryKeys.cart.byUser(userId) : queryKeys.cart.root,
    queryFn: () => getCartByUser(userId as number),
    enabled: typeof userId === "number",
  });
}

export function useWishlistsQuery(params: PageParams & { userId?: number } = {}) {
  return useQuery({
    queryKey: queryKeys.wishlists.list(params),
    queryFn: () => getWishlists(params),
    enabled: typeof params.userId === "number",
  });
}

export function useCreateWishlistMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateWishlistRequest) => createWishlist(request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.wishlists.root });
    },
  });
}

export function useDeleteWishlistMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteWishlist(id),
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

export function useOrdersByUserQuery(userId?: number, params: PageParams = {}) {
  return useQuery({
    queryKey:
      typeof userId === "number"
        ? queryKeys.orders.byUser(userId, params)
        : queryKeys.orders.root,
    queryFn: () => getOrdersByUser(userId as number, params),
    enabled: typeof userId === "number",
  });
}

export function useOrderByCodeQuery(orderCode?: string) {
  return useQuery({
    queryKey: queryKeys.orders.byCode(orderCode ?? ""),
    queryFn: () => getOrderByCode(orderCode as string),
    enabled: Boolean(orderCode),
  });
}

export function useUserAddressesQuery(
  params: PageParams & { userId?: number } = {}
) {
  return useQuery({
    queryKey: queryKeys.addresses.list(params),
    queryFn: () => getUserAddresses(params),
    enabled: typeof params.userId === "number",
  });
}

export function useCreateUserAddressMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateUserAddressRequest) =>
      createUserAddress(request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.addresses.root });
    },
  });
}

export function useUpdateUserAddressMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      request,
    }: {
      id: number;
      request: UpdateUserAddressRequest;
    }) => updateUserAddress(id, request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.addresses.root });
    },
  });
}

export function useDeleteUserAddressMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteUserAddress(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.addresses.root });
    },
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: Partial<User> }) =>
      updateUser(id, request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.root });
    },
  });
}

export function useCreateReviewMutation() {
  return useMutation({
    mutationFn: (request: CreateReviewRequest) => createReview(request),
  });
}
