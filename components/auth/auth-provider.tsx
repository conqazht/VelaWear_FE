"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import apiClient, { setAccessToken } from "@/lib/api-client";

export interface User {
  id: number;
  email: string;
  fullName: string;
  birthDate: string;
  avatar: string | null;
  gender: "MALE" | "FEMALE" | "OTHER";
  createdAt: string;
  updatedAt: string;
}

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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await apiClient.get("/auth/me");
      if (response.data && response.data.data) {
        // Exclude the roles property from the frontend representation
        const userData = { ...response.data.data };
        delete (userData as { roles?: unknown }).roles;
        setUser(userData as User);
      }
    } catch {
      setUser(null);
      setAccessToken(null);
    }
  }, []);

  const checkSession = useCallback(async () => {
    setIsLoading(true);
    try {
      // Call refresh token endpoint to see if a valid refresh cookie exists
      const response = await apiClient.post("/auth/refresh", {});
      if (response.data && response.data.data) {
        const token = response.data.data.accessToken;
        setAccessToken(token);
        await fetchProfile();
      }
    } catch {
      setUser(null);
      setAccessToken(null);
    } finally {
      setIsLoading(false);
    }
  }, [fetchProfile]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkSession();
  }, [checkSession]);

  const signIn = useCallback(
    async (email: string, password: string): Promise<User> => {
      const response = await apiClient.post("/auth/login", { email, password });
      if (response.data && response.data.data) {
        const token = response.data.data.accessToken;
        setAccessToken(token);
        const profileResponse = await apiClient.get("/auth/me");
        const userData = { ...profileResponse.data.data };
        delete (userData as { roles?: unknown }).roles;
        setUser(userData as User);
        return userData as User;
      }
      throw new Error("Invalid login response format");
    },
    []
  );

  const register = useCallback(
    async (data: Record<string, string | null>): Promise<User> => {
      const response = await apiClient.post("/auth/register", data);
      if (response.data && response.data.data) {
        return response.data.data as User;
      }
      throw new Error("Invalid registration response format");
    },
    []
  );

  const signOut = useCallback(async () => {
    try {
      await apiClient.post("/auth/logout", {});
    } catch {
      // Ignored - client logout proceeds regardless of backend response status
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  const isAuthenticated = useMemo(() => user !== null, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated,
      signIn,
      register,
      signOut,
      checkSession,
    }),
    [user, isLoading, isAuthenticated, signIn, register, signOut, checkSession]
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
