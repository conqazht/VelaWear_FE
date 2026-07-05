"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getMe,
  getSessionUser,
  login,
  logout,
  register,
  type LoginRequest,
  type RegisterRequest,
} from "@/lib/api/auth";
import { queryKeys } from "./keys";

export function useSessionQuery() {
  return useQuery({
    queryKey: queryKeys.auth.session,
    queryFn: getSessionUser,
  });
}

export function useProfileQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.auth.session,
    queryFn: getMe,
    enabled,
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: LoginRequest) => login(request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.root });
    },
  });
}

export function useRegisterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: RegisterRequest) => register(request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.root });
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.auth.session, null);
      queryClient.removeQueries({ queryKey: queryKeys.auth.root });
    },
  });
}
