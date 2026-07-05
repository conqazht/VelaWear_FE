"use client";

import { createContext, useContext, useMemo } from "react";
import {
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
  useSessionQuery,
} from "@/lib/queries/auth";
import type { RegisterRequest } from "@/lib/api/auth";
import type { User } from "@/lib/api/types";

export type { User };

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  register: (data: Record<string, string | null>) => Promise<User>;
  signOut: () => Promise<void>;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const sessionQuery = useSessionQuery();
  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const logoutMutation = useLogoutMutation();

  const user = (sessionQuery.data ?? null) as User | null;
  const isLoading = sessionQuery.isLoading || sessionQuery.isFetching;
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
        registerMutation.mutateAsync(data as RegisterRequest),
      signOut: async () => {
        await logoutMutation.mutateAsync();
      },
      checkSession: async () => {
        await sessionQuery.refetch();
      },
    }),
    [
      user,
      isLoading,
      isAuthenticated,
      loginMutation,
      logoutMutation,
      registerMutation,
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
