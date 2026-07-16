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

export function shouldRetryApiError(failureCount: number, error: unknown): boolean {
  return failureCount < 1 && classifyApiError(error).retryable;
}
