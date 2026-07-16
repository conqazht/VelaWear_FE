import apiClient from "./api-client";

export type OtpPurpose =
  | "REGISTER"
  | "FORGOT_PASSWORD"
  | "CHANGE_EMAIL";

export type OtpErrorCode =
  | "OTP_INVALID_OR_EXPIRED"
  | "OTP_ATTEMPTS_EXHAUSTED"
  | "OTP_RATE_LIMITED"
  | "OTP_PROOF_INVALID_OR_EXPIRED"
  | "AUTH_RATE_LIMITED"
  | "SESSION_REVOKED"
  | "OTP_SERVICE_UNAVAILABLE"
  | "OTP_DELIVERY_UNAVAILABLE";

export type OtpErrorKind =
  | "rate_limited"
  | "invalid_or_expired"
  | "attempts_exhausted"
  | "proof_invalid_or_expired"
  | "session_revoked"
  | "validation"
  | "service"
  | "unknown";

export interface OtpRequestPayload {
  email: string;
  purpose: OtpPurpose;
}

export interface OtpVerifyPayload {
  challengeId: string;
  code: string;
}

export interface ForgotPasswordResetPayload {
  email: string;
  newPassword: string;
  otpProofToken: string;
}

export interface ChangeEmailPayload {
  newEmail: string;
  otpProofToken: string;
}

export interface ChangePasswordPayload {
  currentPassword?: string;
  newPassword: string;
}

export interface OtpRequestResult {
  challengeId: string;
  expiresInSeconds: number;
  cooldownSeconds: number;
}

export interface OtpVerifyResult {
  proofToken: string;
  expiresInSeconds: number;
}

export interface SensitiveActionResult {
  allSessionsRevoked: boolean;
  reauthenticationRequired: boolean;
}

export interface NormalizedOtpError {
  code?: OtpErrorCode;
  kind: OtpErrorKind;
  message: string;
  retryAfterSeconds?: number;
}

interface ApiEnvelope<T = unknown> {
  code?: string;
  error?: string;
  errorCode?: string;
  message?: string;
  data?: T;
}

interface RetryDetails {
  retryAfterSeconds?: unknown;
}

interface OtpResponseData {
  challengeId?: unknown;
  proofToken?: unknown;
  expiresInSeconds?: unknown;
  cooldownSeconds?: unknown;
  retryAfterSeconds?: unknown;
  details?: RetryDetails | null;
}

const ERROR_KIND_BY_CODE: Readonly<Record<OtpErrorCode, OtpErrorKind>> = {
  OTP_INVALID_OR_EXPIRED: "invalid_or_expired",
  OTP_ATTEMPTS_EXHAUSTED: "attempts_exhausted",
  OTP_RATE_LIMITED: "rate_limited",
  OTP_PROOF_INVALID_OR_EXPIRED: "proof_invalid_or_expired",
  AUTH_RATE_LIMITED: "rate_limited",
  SESSION_REVOKED: "session_revoked",
  OTP_SERVICE_UNAVAILABLE: "service",
  OTP_DELIVERY_UNAVAILABLE: "service",
};

function isOtpErrorCode(value: unknown): value is OtpErrorCode {
  return typeof value === "string" && value in ERROR_KIND_BY_CODE;
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

function parseRetryAfter(value: unknown): number | undefined {
  const seconds = toPositiveSeconds(value);
  if (seconds) return seconds;

  if (typeof value !== "string") return undefined;
  const retryAt = Date.parse(value);
  if (!Number.isFinite(retryAt)) return undefined;

  return Math.max(1, Math.ceil((retryAt - Date.now()) / 1000));
}

function getRetryAfterHeader(headers: unknown): unknown {
  if (!headers || typeof headers !== "object") return undefined;

  const axiosHeaders = headers as {
    get?: (name: string) => unknown;
    [key: string]: unknown;
  };
  return axiosHeaders.get?.("retry-after") ?? axiosHeaders["retry-after"] ?? axiosHeaders["Retry-After"];
}

function extractRetryAfterSeconds(data?: OtpResponseData | null, headers?: unknown): number | undefined {
  return (
    toPositiveSeconds(data?.retryAfterSeconds) ??
    toPositiveSeconds(data?.details?.retryAfterSeconds) ??
    parseRetryAfter(getRetryAfterHeader(headers))
  );
}

function getFallbackErrorKind(message?: string): OtpErrorKind {
  const normalized = (message ?? "").toLowerCase();

  if (normalized.includes("rate") || normalized.includes("retry") || normalized.includes("cooldown")) {
    return "rate_limited";
  }
  if (normalized.includes("attempt") || normalized.includes("exhaust")) {
    return "attempts_exhausted";
  }
  if (normalized.includes("expired")) {
    return "invalid_or_expired";
  }
  if (normalized.includes("invalid") || normalized.includes("validation") || normalized.includes("otp")) {
    return "validation";
  }
  if (normalized.includes("unavailable") || normalized.includes("service")) {
    return "service";
  }

  return "unknown";
}

function getDefaultOtpMessage(kind: OtpErrorKind): string {
  switch (kind) {
    case "rate_limited":
      return "Please wait before trying again.";
    case "invalid_or_expired":
      return "The verification code is invalid or has expired.";
    case "attempts_exhausted":
      return "Too many incorrect attempts. Request a new verification code.";
    case "proof_invalid_or_expired":
      return "Your verification has expired. Request a new verification code.";
    case "session_revoked":
      return "Your session is no longer valid. Please sign in again.";
    case "validation":
      return "Invalid verification request. Check the entered information and try again.";
    case "service":
      return "Verification service is currently unavailable. Please try again later.";
    default:
      return "Something went wrong. Please try again.";
  }
}

function requireNonEmptyString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Invalid OTP response: missing ${field}`);
  }
  return value;
}

function requirePositiveSeconds(value: unknown, field: string): number {
  const seconds = toPositiveSeconds(value);
  if (!seconds) {
    throw new Error(`Invalid OTP response: missing ${field}`);
  }
  return seconds;
}

function requireSensitiveActionResult(value: unknown): SensitiveActionResult {
  if (
    !value ||
    typeof value !== "object" ||
    typeof (value as SensitiveActionResult).allSessionsRevoked !== "boolean" ||
    typeof (value as SensitiveActionResult).reauthenticationRequired !== "boolean"
  ) {
    throw new Error("Invalid sensitive action response");
  }

  return value as SensitiveActionResult;
}

export function normalizeOtpError(
  error: unknown,
  fallbackMessage = "Something went wrong. Please try again.",
): NormalizedOtpError {
  const apiError = error as {
    response?: {
      headers?: unknown;
      data?: ApiEnvelope<OtpResponseData>;
    };
    message?: string;
  };

  const responseData = apiError.response?.data;
  const rawCode = responseData?.code ?? responseData?.errorCode ?? responseData?.error;
  const code = isOtpErrorCode(rawCode) ? rawCode : undefined;
  const kind = code
    ? ERROR_KIND_BY_CODE[code]
    : getFallbackErrorKind(responseData?.message ?? apiError.message);
  const retryAfterSeconds = extractRetryAfterSeconds(
    responseData?.data,
    apiError.response?.headers,
  );

  return {
    code,
    kind,
    message:
      responseData?.message ??
      (kind === "unknown" ? fallbackMessage : getDefaultOtpMessage(kind)),
    retryAfterSeconds,
  };
}

export async function requestOtp(payload: OtpRequestPayload): Promise<OtpRequestResult> {
  const response = await apiClient.post<ApiEnvelope<OtpResponseData>>(
    "/auth/otp/request",
    payload,
  );
  const data = response.data?.data;

  return {
    challengeId: requireNonEmptyString(data?.challengeId, "challengeId"),
    expiresInSeconds: requirePositiveSeconds(data?.expiresInSeconds, "expiresInSeconds"),
    cooldownSeconds: requirePositiveSeconds(data?.cooldownSeconds, "cooldownSeconds"),
  };
}

export async function verifyOtp(payload: OtpVerifyPayload): Promise<OtpVerifyResult> {
  const response = await apiClient.post<ApiEnvelope<OtpResponseData>>(
    "/auth/otp/verify",
    payload,
  );
  const data = response.data?.data;

  return {
    proofToken: requireNonEmptyString(data?.proofToken, "proofToken"),
    expiresInSeconds: requirePositiveSeconds(data?.expiresInSeconds, "expiresInSeconds"),
  };
}

export async function resetPassword(
  payload: ForgotPasswordResetPayload,
): Promise<SensitiveActionResult> {
  const response = await apiClient.post<ApiEnvelope<SensitiveActionResult>>(
    "/auth/forgot-password/reset",
    payload,
  );
  return requireSensitiveActionResult(response.data.data);
}

export async function changeEmail(payload: ChangeEmailPayload): Promise<SensitiveActionResult> {
  const response = await apiClient.put<ApiEnvelope<SensitiveActionResult>>(
    "/auth/me/email",
    payload,
  );
  return requireSensitiveActionResult(response.data.data);
}

export async function changePassword(
  payload: ChangePasswordPayload,
): Promise<SensitiveActionResult> {
  const response = await apiClient.put<ApiEnvelope<SensitiveActionResult>>(
    "/auth/me/password",
    payload,
  );
  return requireSensitiveActionResult(response.data.data);
}
