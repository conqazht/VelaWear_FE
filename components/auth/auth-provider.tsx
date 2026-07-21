"use client";

import { createContext, useContext, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
  useSessionQuery,
} from "@/lib/queries/auth";
import type { RegisterRequest } from "@/lib/api/auth";
import type { User } from "@/lib/api/types";
import { useCartStore } from "@/store/cart-store";
import { clearLocalAuthSession } from "@/lib/api-client";
import { queryKeys } from "@/lib/queries/keys";

export type { User };

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  register: (data: RegisterRequest) => Promise<User>;
  signOut: () => Promise<void>;
  checkSession: () => Promise<void>;
  clearRevokedSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const sessionQuery = useSessionQuery();
  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const logoutMutation = useLogoutMutation();
  const queryClient = useQueryClient();
  const releaseToAnonymous = useCartStore((state) => state.releaseToAnonymous);

  const user = (sessionQuery.data ?? null) as User | null;
  const isLoading = sessionQuery.isPending;
  const isAuthenticated = user !== null;

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated,
      signIn: async (email, password) => {
        await loginMutation.mutateAsync({ email, password });
        const profile = await sessionQuery.refetch();

        if (!profile.data) {
          throw new Error("Invalid login response format");
        }

        return profile.data as User;
      },
      register: async (data) =>
        registerMutation.mutateAsync(data),
      signOut: async () => {
        await logoutMutation.mutateAsync();
        releaseToAnonymous();
      },
      checkSession: async () => {
        await sessionQuery.refetch();
      },
      clearRevokedSession: async () => {
        clearLocalAuthSession();
        try {
          await queryClient.cancelQueries({ queryKey: queryKeys.auth.root });
        } finally {
          queryClient.setQueryData(queryKeys.auth.session, null);
          queryClient.removeQueries({ queryKey: queryKeys.auth.root });
          releaseToAnonymous();
        }
      },
    }),
    [
      user,
      isLoading,
      isAuthenticated,
      loginMutation,
      logoutMutation,
      queryClient,
      registerMutation,
      releaseToAnonymous,
      sessionQuery,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
