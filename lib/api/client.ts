import apiClient from "@/lib/api-client";
import type { ApiResponse } from "./types";

export function unwrapApiResponse<T>(response: { data: ApiResponse<T> }): T {
  return response.data.data;
}

export async function apiGet<T>(path: string, params?: Record<string, unknown>): Promise<T> {
  const response = await apiClient.get<ApiResponse<T>>(path, { params });
  return unwrapApiResponse(response);
}

export async function apiPost<T, TBody = unknown>(path: string, body?: TBody): Promise<T> {
  const response = await apiClient.post<ApiResponse<T>>(path, body);
  return unwrapApiResponse(response);
}

export async function apiPut<T, TBody = unknown>(path: string, body: TBody): Promise<T> {
  const response = await apiClient.put<ApiResponse<T>>(path, body);
  return unwrapApiResponse(response);
}

export async function apiDelete<T = void>(path: string): Promise<T> {
  const response = await apiClient.delete<ApiResponse<T>>(path);
  return unwrapApiResponse(response);
}
