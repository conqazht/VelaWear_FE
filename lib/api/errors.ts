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
