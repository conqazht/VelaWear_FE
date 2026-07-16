import {
  logoutAuthSession,
  refreshAccessTokenOnce,
  setAccessToken,
  withAuthSessionLock,
} from "@/lib/api-client";
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
  otpProofToken: string;
};

export type TokenResponse = {
  accessToken: string;
  tokenType?: string;
  expiresIn?: number;
};

export type OAuth2ExchangeRequest = {
  code: string;
};

function normalizeUser(user: User): User {
  return { ...user, hasPassword: Boolean(user.hasPassword) };
}

export async function login(request: LoginRequest): Promise<TokenResponse> {
  return withAuthSessionLock(async () => {
    const token = await apiPost<TokenResponse, LoginRequest>("/auth/login", request);
    setAccessToken(token.accessToken);
    return token;
  });
}

export async function exchangeOAuth2Code(
  request: OAuth2ExchangeRequest
): Promise<TokenResponse> {
  return withAuthSessionLock(async () => {
    const token = await apiPost<TokenResponse, OAuth2ExchangeRequest>(
      "/auth/oauth2/exchange",
      request
    );
    setAccessToken(token.accessToken);
    return token;
  });
}

export async function register(request: RegisterRequest): Promise<User> {
  return normalizeUser(await apiPost<User, RegisterRequest>("/auth/register", request));
}

export async function refreshSession(): Promise<TokenResponse> {
  const accessToken = await refreshAccessTokenOnce();
  return { accessToken };
}

export async function logout(): Promise<void> {
  await logoutAuthSession();
}

export async function getMe(): Promise<User> {
  return normalizeUser(await apiGet<User>("/auth/me"));
}

export async function getSessionUser(): Promise<User> {
  await refreshSession();
  return getMe();
}
