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

export function hasSessionHint(): boolean {
  if (typeof document === "undefined") return false;
  if (process.env.NODE_ENV === "test") return true;
  return document.cookie.split(";").some((item) => item.trim().startsWith("vela_session_hint="));
}

export function useSessionQuery() {
  return useQuery({
    queryKey: queryKeys.auth.session,
    queryFn: async () => {
      if (!hasSessionHint()) {
        return null;
      }
      try {
        return await getSessionUser();
      } catch {
        return null;
      }
    },
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
  return useMutation({
    mutationFn: (request: LoginRequest) => login(request),
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
