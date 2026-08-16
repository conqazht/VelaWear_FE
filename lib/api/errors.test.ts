import { describe, expect, it } from "vitest";
import {
  classifyApiError,
  getApiErrorStatus,
  shouldRetryApiError,
  extractRetryAfterSeconds,
  getQueryRetryDelayMs,
} from "./errors";

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

describe("extractRetryAfterSeconds and getQueryRetryDelayMs", () => {
  it("extracts from data.retryAfterSeconds", () => {
    const error = { response: { data: { retryAfterSeconds: 45 } } };
    expect(extractRetryAfterSeconds(error)).toBe(45);
    expect(getQueryRetryDelayMs(0, error)).toBe(45000);
  });

  it("extracts from data.details.retryAfterSeconds", () => {
    const error = { response: { data: { details: { retryAfterSeconds: 60 } } } };
    expect(extractRetryAfterSeconds(error)).toBe(60);
    expect(getQueryRetryDelayMs(0, error)).toBe(60000);
  });

  it("extracts from headers retry-after numeric", () => {
    const error = { response: { headers: { "retry-after": "120" } } };
    expect(extractRetryAfterSeconds(error)).toBe(120);
    expect(getQueryRetryDelayMs(0, error)).toBe(120000);
  });

  it("extracts from Axios headers get()", () => {
    const error = {
      response: {
        headers: {
          get: (name: string) => (name.toLowerCase() === "retry-after" ? "90" : null),
        },
      },
    };
    expect(extractRetryAfterSeconds(error)).toBe(90);
    expect(getQueryRetryDelayMs(0, error)).toBe(90000);
  });

  it("extracts HTTP-date from headers", () => {
    const now = Date.now();
    const retryAt = new Date(now + 120000).toUTCString();
    const error = { response: { headers: { "retry-after": retryAt } } };
    const seconds = extractRetryAfterSeconds(error, now);
    expect(seconds).toBe(120);
    expect(getQueryRetryDelayMs(0, error, now)).toBe(120000);
  });

  it("returns undefined for malformed, zero, negative or past values", () => {
    const now = Date.now();
    expect(
      extractRetryAfterSeconds({ response: { data: { retryAfterSeconds: -10 } } }),
    ).toBeUndefined();
    expect(
      extractRetryAfterSeconds({ response: { headers: { "retry-after": "0" } } }),
    ).toBeUndefined();
    expect(
      extractRetryAfterSeconds({ response: { headers: { "retry-after": "invalid" } } }),
    ).toBeUndefined();
    expect(
      extractRetryAfterSeconds(
        { response: { headers: { "retry-after": new Date(now - 10000).toUTCString() } } },
        now,
      ),
    ).toBeUndefined();
  });

  it("uses exponential backoff when retryAfter is missing", () => {
    const error = { response: { status: 500 } };
    expect(getQueryRetryDelayMs(0, error)).toBe(1000);
    expect(getQueryRetryDelayMs(1, error)).toBe(2000);
    expect(getQueryRetryDelayMs(2, error)).toBe(4000);
    expect(getQueryRetryDelayMs(5, error)).toBe(30000); // capped at 30000
  });

  it("shouldRetryApiError allows retry for 429 if delay <= 300 seconds", () => {
    const error = { response: { status: 429, data: { retryAfterSeconds: 300 } } };
    expect(shouldRetryApiError(0, error)).toBe(true);
  });

  it("shouldRetryApiError rejects retry for 429 if delay > 300 seconds", () => {
    const error = { response: { status: 429, data: { retryAfterSeconds: 301 } } };
    expect(shouldRetryApiError(0, error)).toBe(false);
  });
});
