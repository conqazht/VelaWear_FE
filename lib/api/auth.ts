import { setAccessToken } from "@/lib/api-client";
import { apiGet, apiPost } from "./client";
import type { User } from "./types";

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
  fullName: string;
  birthDate?: string | null;
  gender?: "MALE" | "FEMALE" | "OTHER" | null;
};

export type TokenResponse = {
  accessToken: string;
  tokenType?: string;
  expiresIn?: number;
};

function normalizeUser(user: User): User {
  const normalized = { ...user };
  delete normalized.roles;
  return normalized;
}

export async function login(request: LoginRequest): Promise<TokenResponse> {
  const token = await apiPost<TokenResponse, LoginRequest>("/auth/login", request);
  setAccessToken(token.accessToken);
  return token;
}

export async function register(request: RegisterRequest): Promise<User> {
  return normalizeUser(await apiPost<User, RegisterRequest>("/auth/register", request));
}

export async function refreshSession(): Promise<TokenResponse> {
  const token = await apiPost<TokenResponse, Record<string, never>>(
    "/auth/refresh",
    {}
  );
  setAccessToken(token.accessToken);
  return token;
}

export async function logout(): Promise<void> {
  try {
    await apiPost<void, Record<string, never>>("/auth/logout", {});
  } finally {
    setAccessToken(null);
  }
}

export async function getMe(): Promise<User> {
  return normalizeUser(await apiGet<User>("/auth/me"));
}

export async function getSessionUser(): Promise<User> {
  await refreshSession();
  return getMe();
}
