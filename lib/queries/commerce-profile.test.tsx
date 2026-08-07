import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetMyAddresses, mockGetMyOrders } = vi.hoisted(() => ({
  mockGetMyAddresses: vi.fn(),
  mockGetMyOrders: vi.fn(),
}));

vi.mock("@/lib/api/commerce", () => ({
  getMyOrders: (...args: unknown[]) => mockGetMyOrders(...args),
  getMyAddresses: (...args: unknown[]) => mockGetMyAddresses(...args),
}));

import { useMyAddressesQuery, useMyOrdersQuery } from "./commerce";

describe("Profile data queries demand gating (FE-008)", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  }

  describe("useMyOrdersQuery", () => {
    it("không phát sinh API call khi enabled = false", async () => {
      mockGetMyOrders.mockResolvedValue({ result: [], meta: { page: 1, pageSize: 100, pages: 1, total: 0 } });

      const { result } = renderHook(
        () => useMyOrdersQuery(1, { size: 100 }, false),
        { wrapper }
      );

      expect(result.current.fetchStatus).toBe("idle");
      expect(result.current.isFetching).toBe(false);
      expect(mockGetMyOrders).not.toHaveBeenCalled();
    });

    it("phát sinh API call khi enabled = true", async () => {
      mockGetMyOrders.mockResolvedValue({ result: [], meta: { page: 1, pageSize: 100, pages: 1, total: 0 } });

      const { result } = renderHook(
        () => useMyOrdersQuery(1, { size: 100 }, true),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockGetMyOrders).toHaveBeenCalledTimes(1);
    });

    it("không phát sinh API call khi không có accountId dù enabled = true", () => {
      const { result } = renderHook(
        () => useMyOrdersQuery(undefined, { size: 100 }, true),
        { wrapper }
      );

      expect(result.current.fetchStatus).toBe("idle");
      expect(mockGetMyOrders).not.toHaveBeenCalled();
    });
  });

  describe("useMyAddressesQuery", () => {
    it("không phát sinh API call khi enabled = false", () => {
      mockGetMyAddresses.mockResolvedValue({ result: [], meta: { page: 1, pageSize: 100, pages: 1, total: 0 } });

      const { result } = renderHook(
        () => useMyAddressesQuery(1, { size: 100 }, false),
        { wrapper }
      );

      expect(result.current.fetchStatus).toBe("idle");
      expect(result.current.isFetching).toBe(false);
      expect(mockGetMyAddresses).not.toHaveBeenCalled();
    });

    it("phát sinh API call khi enabled = true", async () => {
      mockGetMyAddresses.mockResolvedValue({ result: [], meta: { page: 1, pageSize: 100, pages: 1, total: 0 } });

      const { result } = renderHook(
        () => useMyAddressesQuery(1, { size: 100 }, true),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockGetMyAddresses).toHaveBeenCalledTimes(1);
    });

    it("không phát sinh API call khi không có accountId dù enabled = true", () => {
      const { result } = renderHook(
        () => useMyAddressesQuery(undefined, { size: 100 }, true),
        { wrapper }
      );

      expect(result.current.fetchStatus).toBe("idle");
      expect(mockGetMyAddresses).not.toHaveBeenCalled();
    });
  });
});
