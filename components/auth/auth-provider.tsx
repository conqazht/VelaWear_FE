"use client";

import { createContext, useContext, useMemo, useState } from "react";
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
import { clearLocalAuthSession, hasLocalAuthSessionHint } from "@/lib/api-client";
import { queryKeys } from "@/lib/queries/keys";

export type { User };

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  /**
   * True when this browser has logged in before and not logged out since.
   * Lets UI show the login link instantly for fresh anonymous visitors while
   * reserving the loading skeleton for sessions that may actually exist.
   */
  hasSessionHint: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  register: (data: RegisterRequest) => Promise<User>;
  signOut: () => Promise<void>;
  checkSession: () => Promise<void>;
  clearRevokedSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
  initialHasSessionHint?: boolean;
}

export function AuthProvider({ children, initialHasSessionHint }: AuthProviderProps) {
  const [hintState, setHintState] = useState(() => {
    if (typeof initialHasSessionHint === "boolean") {
      return initialHasSessionHint;
    }
    return hasLocalAuthSessionHint();
  });

  const sessionQuery = useSessionQuery(hintState);
  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const logoutMutation = useLogoutMutation();
  const queryClient = useQueryClient();
  const releaseToAnonymous = useCartStore((state) => state.releaseToAnonymous);

  const user = (sessionQuery.data ?? null) as User | null;
  const hasSessionHint = hintState && !(sessionQuery.isSuccess && sessionQuery.data === null);
  const isLoading = hasSessionHint && sessionQuery.isPending;
  const isAuthenticated = user !== null;

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated,
      hasSessionHint,
      signIn: async (email, password) => {
        await loginMutation.mutateAsync({ email, password });
        setHintState(true);
        const profile = await sessionQuery.refetch();

        if (!profile.data) {
          throw new Error("Invalid login response format");
        }

        return profile.data as User;
      },
      register: async (data) => registerMutation.mutateAsync(data),
      signOut: async () => {
        await logoutMutation.mutateAsync();
        setHintState(false);
        queryClient.removeQueries({ queryKey: queryKeys.notifications.root });
        releaseToAnonymous();
      },
      checkSession: async () => {
        setHintState(true);
        await sessionQuery.refetch();
      },
      clearRevokedSession: async () => {
        clearLocalAuthSession();
        setHintState(false);
        try {
          await queryClient.cancelQueries({ queryKey: queryKeys.auth.root });
        } finally {
          queryClient.setQueryData(queryKeys.auth.session, null);
          queryClient.removeQueries({ queryKey: queryKeys.auth.root });
          queryClient.removeQueries({ queryKey: queryKeys.notifications.root });
          releaseToAnonymous();
        }
      },
    }),
    [
      user,
      isLoading,
      isAuthenticated,
      hasSessionHint,
      loginMutation,
      logoutMutation,
      queryClient,
      registerMutation,
      releaseToAnonymous,
      sessionQuery,
    ],
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
