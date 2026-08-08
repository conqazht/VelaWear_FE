import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { QueryProvider } from "./query-provider";
import { useQueryClient } from "@tanstack/react-query";
import { shouldRetryApiError, getQueryRetryDelayMs } from "@/lib/api/errors";
import React from "react";

describe("QueryProvider configuration", () => {
  it("configures queryClient with correct retry and retryDelay behavior", () => {
    const { result } = renderHook(() => useQueryClient(), {
      wrapper: ({ children }) => <QueryProvider>{children}</QueryProvider>,
    });

    const queryClient = result.current;
    const defaultOptions = queryClient.getDefaultOptions();

    expect(defaultOptions.queries?.retry).toBe(shouldRetryApiError);
    expect(defaultOptions.queries?.retryDelay).toBe(getQueryRetryDelayMs);
    expect(defaultOptions.mutations?.retry).toBe(0);
  });
});
