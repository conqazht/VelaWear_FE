import type { ApiResponse } from "./types";

export const API_BASE_URL =
  process.env.BACKEND_API_URL ||
  (process.env.NEXT_PUBLIC_API_URL?.startsWith("http")
    ? process.env.NEXT_PUBLIC_API_URL
    : undefined) ||
  "http://localhost:8080/api/v1";

type ServerFetchOptions = {
  query?: Record<string, string | number | boolean | null | undefined>;
  next?: NextFetchRequestConfig;
  cache?: RequestCache;
  signal?: AbortSignal;
};

function buildUrl(path: string, query?: ServerFetchOptions["query"]) {
  const url = new URL(`${API_BASE_URL}${path}`);

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url;
}

export async function serverApiGet<T>(path: string, options: ServerFetchOptions = {}): Promise<T> {
  const response = await fetch(buildUrl(path, options.query), {
    cache: options.cache,
    next: options.next ?? { revalidate: 300 },
    signal: options.signal ?? AbortSignal.timeout(3000),
  });

  if (!response.ok) {
    throw new Error(`Server API request failed: ${response.status} ${path}`);
  }

  const payload = (await response.json()) as ApiResponse<T>;
  return payload.data;
}
