import apiClient from "./api-client";
import { getApiErrorStatus, extractRetryAfterSeconds } from "./api/errors";

export type OtpPurpose = "REGISTER" | "FORGOT_PASSWORD" | "CHANGE_EMAIL";

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
  | "duplicate"
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

function getFallbackErrorKind(status: number | null): OtpErrorKind {
  if (status === 429) return "rate_limited";
  if (status === 409) return "duplicate";
  if (status === 401) return "session_revoked";
  if (status !== null && status >= 500) return "service";
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
    case "duplicate":
      return "This email address is already in use.";
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
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.ceil(value);
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) {
      return Math.ceil(parsed);
    }
  }

  throw new Error(`Invalid OTP response: missing ${field}`);
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

  const status = getApiErrorStatus(error);

  const kind = code ? ERROR_KIND_BY_CODE[code] : getFallbackErrorKind(status);

  const retryAfterSeconds = extractRetryAfterSeconds(error);

  return {
    code,
    kind,
    message:
      responseData?.message ?? (kind === "unknown" ? fallbackMessage : getDefaultOtpMessage(kind)),
    retryAfterSeconds,
  };
}

export async function requestOtp(payload: OtpRequestPayload): Promise<OtpRequestResult> {
  const response = await apiClient.post<ApiEnvelope<OtpResponseData>>("/auth/otp/request", payload);
  const data = response.data?.data;

  return {
    challengeId: requireNonEmptyString(data?.challengeId, "challengeId"),
    expiresInSeconds: requirePositiveSeconds(data?.expiresInSeconds, "expiresInSeconds"),
    cooldownSeconds: requirePositiveSeconds(data?.cooldownSeconds, "cooldownSeconds"),
  };
}

export async function verifyOtp(payload: OtpVerifyPayload): Promise<OtpVerifyResult> {
  const response = await apiClient.post<ApiEnvelope<OtpResponseData>>("/auth/otp/verify", payload);
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
