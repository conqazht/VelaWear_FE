import type {
  AxiosAdapter,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
};

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

function successResponse(config: InternalAxiosRequestConfig): AxiosResponse {
  return {
    config,
    data: { ok: true },
    headers: {},
    status: 200,
    statusText: "OK",
  };
}

async function loadApiClient() {
  const axiosModule = await import("axios");
  const refresh = deferred<AxiosResponse>();
  const refreshPost = vi.spyOn(axiosModule.default, "post").mockReturnValue(refresh.promise);
  const apiClientModule = await import("@/lib/api-client");

  return {
    apiClient: apiClientModule.default as AxiosInstance,
    refresh,
    refreshPost,
    clearLocalAuthSession: apiClientModule.clearLocalAuthSession,
    getAccessToken: apiClientModule.getAccessToken,
    refreshAccessTokenOnce: apiClientModule.refreshAccessTokenOnce,
    setAccessToken: apiClientModule.setAccessToken,
  };
}

describe("apiClient concurrent 401 refresh", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("dùng chung một refresh request rồi retry tất cả request bằng token mới", async () => {
    const { apiClient, refresh, refreshPost, setAccessToken } = await loadApiClient();
    setAccessToken("expired-token");
    const attempts: Array<{ authorization?: unknown; retry: boolean; url?: string }> = [];

    const adapter = vi.fn<AxiosAdapter>(async (config) => {
      attempts.push({
        authorization: config.headers.Authorization,
        retry: Boolean((config as RetryConfig)._retry),
        url: config.url,
      });
      if (!(config as RetryConfig)._retry) {
        const axiosModule = await import("axios");
        throw new axiosModule.AxiosError(
          "Unauthorized",
          axiosModule.AxiosError.ERR_BAD_REQUEST,
          config,
          undefined,
          {
            config,
            data: null,
            headers: {},
            status: 401,
            statusText: "Unauthorized",
          },
        );
      }

      return successResponse(config);
    });
    apiClient.defaults.adapter = adapter;

    const requests = Promise.all([
      apiClient.get("/race/first"),
      apiClient.get("/race/second"),
    ]);

    await vi.waitFor(() => expect(refreshPost).toHaveBeenCalledTimes(1));
    expect(refreshPost).toHaveBeenCalledWith(
      "http://localhost:8080/api/v1/auth/refresh",
      {},
      { timeout: 15_000, withCredentials: true },
    );

    refresh.resolve({
      config: {} as InternalAxiosRequestConfig,
      data: { data: { accessToken: "fresh-token" } },
      headers: {},
      status: 200,
      statusText: "OK",
    });

    await expect(requests).resolves.toHaveLength(2);
    expect(adapter).toHaveBeenCalledTimes(4);

    const retryAttempts = attempts.filter((attempt) => attempt.retry);
    expect(retryAttempts).toHaveLength(2);
    expect(retryAttempts.map((attempt) => attempt.authorization)).toEqual([
      "Bearer fresh-token",
      "Bearer fresh-token",
    ]);
  });

  it("mở single-flight gate lại sau khi refresh trước đã hoàn tất", async () => {
    const { apiClient, refresh, refreshPost, setAccessToken } = await loadApiClient();
    setAccessToken("expired-token");

    const adapter = vi.fn<AxiosAdapter>(async (config) => {
      if (!(config as RetryConfig)._retry) {
        const axiosModule = await import("axios");
        throw new axiosModule.AxiosError(
          "Unauthorized",
          axiosModule.AxiosError.ERR_BAD_REQUEST,
          config,
          undefined,
          {
            config,
            data: null,
            headers: {},
            status: 401,
            statusText: "Unauthorized",
          },
        );
      }
      return successResponse(config);
    });
    apiClient.defaults.adapter = adapter;

    const firstRequest = apiClient.get("/race/first-cycle");
    await vi.waitFor(() => expect(refreshPost).toHaveBeenCalledTimes(1));
    refresh.resolve({
      config: {} as InternalAxiosRequestConfig,
      data: { data: { accessToken: "first-fresh-token" } },
      headers: {},
      status: 200,
      statusText: "OK",
    });
    await firstRequest;

    const secondRefresh = deferred<AxiosResponse>();
    refreshPost.mockReturnValueOnce(secondRefresh.promise);
    const secondRequest = apiClient.get("/race/second-cycle");
    await vi.waitFor(() => expect(refreshPost).toHaveBeenCalledTimes(2));
    secondRefresh.resolve({
      config: {} as InternalAxiosRequestConfig,
      data: { data: { accessToken: "second-fresh-token" } },
      headers: {},
      status: 200,
      statusText: "OK",
    });

    await expect(secondRequest).resolves.toMatchObject({ status: 200 });
  });

  it("logout retry không Bearer khi access token hết hạn (initial 401 -> cookie 200)", async () => {
    const axiosModule = await import("axios");
    const logoutPost = vi.spyOn(axiosModule.default, "post")
      .mockRejectedValueOnce({ isAxiosError: true, response: { status: 401 } })
      .mockResolvedValueOnce({} as AxiosResponse);
    const apiClientModule = await import("@/lib/api-client");
    apiClientModule.setAccessToken("expired-access-token");

    await expect(apiClientModule.logoutAuthSession()).resolves.toBeUndefined();
    expect(apiClientModule.getAccessToken()).toBeNull();

    expect(logoutPost).toHaveBeenCalledTimes(2);
    expect(logoutPost).toHaveBeenNthCalledWith(
      1,
      "http://localhost:8080/api/v1/auth/logout",
      {},
      {
        headers: { Authorization: "Bearer expired-access-token" },
        timeout: 15_000,
        withCredentials: true,
      },
    );
    expect(logoutPost).toHaveBeenNthCalledWith(
      2,
      "http://localhost:8080/api/v1/auth/logout",
      {},
      { timeout: 15_000, withCredentials: true },
    );
  });

  it("logout retry thất bại với final 401 (stable unauthenticated) -> clear token", async () => {
    const axiosModule = await import("axios");
    vi.spyOn(axiosModule.default, "post")
      .mockRejectedValueOnce({ isAxiosError: true, response: { status: 401 } })
      .mockRejectedValueOnce({ isAxiosError: true, response: { status: 401 } });
    const apiClientModule = await import("@/lib/api-client");
    apiClientModule.setAccessToken("expired-access-token");

    // Resolves successfully because session is already gone on server
    await expect(apiClientModule.logoutAuthSession()).resolves.toBeUndefined();
    expect(apiClientModule.getAccessToken()).toBeNull();
  });

  it("logout initial 500/network error -> throw & keep token", async () => {
    const axiosModule = await import("axios");
    const networkError = new Error("Network error");
    (networkError as unknown as { isAxiosError: boolean }).isAxiosError = true;
    vi.spyOn(axiosModule.default, "post").mockRejectedValueOnce(networkError);
    const apiClientModule = await import("@/lib/api-client");
    apiClientModule.setAccessToken("valid-access-token");

    await expect(apiClientModule.logoutAuthSession()).rejects.toThrow("Network error");
    expect(apiClientModule.getAccessToken()).toBe("valid-access-token");
  });

  it("logout retry 500 error -> throw & keep token", async () => {
    const axiosModule = await import("axios");
    vi.spyOn(axiosModule.default, "post")
      .mockRejectedValueOnce({ isAxiosError: true, response: { status: 401 } })
      .mockRejectedValueOnce({ isAxiosError: true, response: { status: 500 } });
    const apiClientModule = await import("@/lib/api-client");
    apiClientModule.setAccessToken("valid-access-token");

    await expect(apiClientModule.logoutAuthSession()).rejects.toMatchObject({
      isAxiosError: true,
      response: { status: 500 }
    });
    // Local auth is kept so the user can retry
    expect(apiClientModule.getAccessToken()).toBe("valid-access-token");
  });

  it("xóa local session và chặn refresh đang bay ghi token trở lại", async () => {
    const {
      refresh,
      refreshAccessTokenOnce,
      clearLocalAuthSession,
      getAccessToken,
      setAccessToken,
    } = await loadApiClient();
    setAccessToken("old-token");

    const pendingRefresh = refreshAccessTokenOnce();
    clearLocalAuthSession();
    expect(getAccessToken()).toBeNull();

    refresh.resolve({
      config: {} as InternalAxiosRequestConfig,
      data: { data: { accessToken: "stale-refreshed-token" } },
      headers: {},
      status: 200,
      statusText: "OK",
    });

    await expect(pendingRefresh).rejects.toThrow(
      "Auth session changed while refresh was in flight",
    );
    expect(getAccessToken()).toBeNull();
  });
});
