export type ApiErrorKind = "cancelled" | "http" | "network" | "unexpected";

export type ApiErrorClassification = {
  kind: ApiErrorKind;
  status: number | null;
  retryable: boolean;
};

const NETWORK_ERROR_CODES = new Set([
  "ECONNABORTED",
  "ERR_NETWORK",
  "ERR_CONNECTION_ABORTED",
  "ETIMEDOUT",
]);

const CANCEL_ERROR_CODES = new Set(["ERR_CANCELED", "ERR_CANCELLED"]);

function readErrorCode(error: unknown): string | null {
  if (typeof error !== "object" || error === null || !("code" in error)) return null;
  const code = (error as { code?: unknown }).code;
  return typeof code === "string" ? code.toUpperCase() : null;
}

export function getApiErrorStatus(error: unknown): number | null {
  if (typeof error !== "object" || error === null) return null;

  const maybeApiError = error as {
    status?: unknown;
    response?: {
      status?: unknown;
      data?: { statusCode?: unknown };
    };
  };
  const possibleStatuses = [
    maybeApiError.response?.status,
    maybeApiError.response?.data?.statusCode,
    maybeApiError.status,
  ];

  for (const possibleStatus of possibleStatuses) {
    const status = typeof possibleStatus === "string" ? Number(possibleStatus) : possibleStatus;
    if (typeof status === "number" && Number.isInteger(status) && status >= 100 && status <= 599) {
      return status;
    }
  }

  return null;
}

export function classifyApiError(error: unknown): ApiErrorClassification {
  const code = readErrorCode(error);
  if (code && CANCEL_ERROR_CODES.has(code)) {
    return { kind: "cancelled", status: null, retryable: false };
  }

  const status = getApiErrorStatus(error);
  if (status !== null) {
    return {
      kind: "http",
      status,
      retryable: status === 408 || status === 429 || status >= 500,
    };
  }

  const maybeTransportError = error as { request?: unknown; response?: unknown };
  const looksLikeNetworkError =
    (code !== null && NETWORK_ERROR_CODES.has(code)) ||
    (typeof error === "object" && error !== null && Boolean(maybeTransportError.request) && !maybeTransportError.response);

  if (looksLikeNetworkError) {
    return { kind: "network", status: 503, retryable: true };
  }

  return { kind: "unexpected", status: 500, retryable: true };
}

function toPositiveSeconds(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.ceil(value);
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) {
      return Math.ceil(parsed);
    }
  }

  return undefined;
}

function parseRetryAfter(value: unknown, nowMs: number): number | undefined {
  const seconds = toPositiveSeconds(value);
  if (seconds) return seconds;

  if (typeof value !== "string") return undefined;
  const retryAt = Date.parse(value);
  if (!Number.isFinite(retryAt)) return undefined;

  const diffSeconds = Math.ceil((retryAt - nowMs) / 1000);
  if (diffSeconds <= 0) return undefined;
  return diffSeconds;
}

function getRetryAfterHeader(headers: unknown): unknown {
  if (!headers || typeof headers !== "object") return undefined;

  const axiosHeaders = headers as {
    get?: (name: string) => unknown;
    [key: string]: unknown;
  };
  return axiosHeaders.get?.("retry-after") ?? axiosHeaders["retry-after"] ?? axiosHeaders["Retry-After"];
}

export function extractRetryAfterSeconds(error: unknown, nowMs = Date.now()): number | undefined {
  if (typeof error !== "object" || error === null) return undefined;

  const maybeApiError = error as {
    response?: {
      headers?: unknown;
      data?: {
        retryAfterSeconds?: unknown;
        details?: {
          retryAfterSeconds?: unknown;
        };
      };
    };
  };

  const responseData = maybeApiError.response?.data as {
    data?: { retryAfterSeconds?: unknown; details?: { retryAfterSeconds?: unknown } };
    retryAfterSeconds?: unknown;
    details?: { retryAfterSeconds?: unknown };
  } | undefined;
  const innerData = responseData?.data;
  const headers = maybeApiError.response?.headers;

  return (
    toPositiveSeconds(innerData?.retryAfterSeconds) ??
    toPositiveSeconds(responseData?.retryAfterSeconds) ??
    toPositiveSeconds(innerData?.details?.retryAfterSeconds) ??
    toPositiveSeconds(responseData?.details?.retryAfterSeconds) ??
    parseRetryAfter(getRetryAfterHeader(headers), nowMs)
  );
}

export function getQueryRetryDelayMs(attemptIndex: number, error: unknown, nowMs = Date.now()): number {
  const seconds = extractRetryAfterSeconds(error, nowMs);
  if (seconds !== undefined) {
    return seconds * 1000;
  }
  return Math.min(1000 * 2 ** attemptIndex, 30000);
}

export function shouldRetryApiError(failureCount: number, error: unknown, nowMs = Date.now()): boolean {
  if (failureCount >= 1) return false;
  
  const classification = classifyApiError(error);
  if (!classification.retryable) return false;

  if (classification.status === 429) {
    const delaySeconds = extractRetryAfterSeconds(error, nowMs);
    if (delaySeconds !== undefined && delaySeconds > 300) {
      return false;
    }
  }

  return true;
}
