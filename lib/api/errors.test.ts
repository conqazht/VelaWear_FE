import { describe, expect, it } from "vitest";

import { classifyApiError, getApiErrorStatus, shouldRetryApiError } from "./errors";

describe("API error classification", () => {
  it("keeps a concrete HTTP status and does not retry deterministic 4xx", () => {
    const error = { response: { status: 400, data: { statusCode: 400 } } };

    expect(getApiErrorStatus(error)).toBe(400);
    expect(classifyApiError(error)).toEqual({ kind: "http", status: 400, retryable: false });
    expect(shouldRetryApiError(0, error)).toBe(false);
  });

  it("maps response-less network failures to a retryable 503", () => {
    const error = { code: "ERR_NETWORK", request: {} };

    expect(classifyApiError(error)).toEqual({ kind: "network", status: 503, retryable: true });
    expect(shouldRetryApiError(0, error)).toBe(true);
    expect(shouldRetryApiError(1, error)).toBe(false);
  });

  it("retries 408, 429 and server errors once", () => {
    for (const status of [408, 429, 500, 503]) {
      expect(shouldRetryApiError(0, { response: { status } })).toBe(true);
      expect(shouldRetryApiError(1, { response: { status } })).toBe(false);
    }
  });

  it("ignores cancelled requests", () => {
    expect(classifyApiError({ code: "ERR_CANCELED" })).toEqual({
      kind: "cancelled",
      status: null,
      retryable: false,
    });
  });
});
