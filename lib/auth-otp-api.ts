import apiClient from "./api-client";

export type OtpPurpose =
  | "REGISTER"
  | "FORGOT_PASSWORD"
  | "CHANGE_EMAIL";
export type OtpErrorKind =
  | "cooldown"
  | "expired"
  | "attempts_exhausted"
  | "validation"
  | "service"
  | "unknown";

export interface OtpRequestPayload {
  email: string;
  purpose: OtpPurpose;
}

export interface OtpVerifyPayload {
  email: string;
  purpose: OtpPurpose;
  code: string;
}

export interface ForgotPasswordResetPayload {
  email: string;
  newPassword: string;
}

export interface ChangeEmailPayload {
  newEmail: string;
}

export interface ChangePasswordPayload {
  currentPassword?: string;
  newPassword: string;
}

export interface OtpRequestResult {
  message?: string;
  cooldownSeconds?: number;
}

export interface NormalizedOtpError {
  kind: OtpErrorKind;
  message: string;
  cooldownSeconds?: number;
}

interface ApiEnvelope<T = unknown> {
  code?: string;
  errorCode?: string;
  message?: string;
  data?: T;
}

interface OtpResponseData {
  cooldownSeconds?: number;
  cooldown?: number;
  retryAfterSeconds?: number;
  resendAfterSeconds?: number;
  retryAfter?: number;
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

function extractCooldownSeconds(data?: OtpResponseData | null, retryAfterHeader?: unknown): number | undefined {
  return (
    toPositiveSeconds(data?.cooldownSeconds) ??
    toPositiveSeconds(data?.cooldown) ??
    toPositiveSeconds(data?.retryAfterSeconds) ??
    toPositiveSeconds(data?.resendAfterSeconds) ??
    toPositiveSeconds(data?.retryAfter) ??
    toPositiveSeconds(retryAfterHeader)
  );
}

function getErrorKind(code?: string, message?: string): OtpErrorKind {
  const normalized = `${code ?? ""} ${message ?? ""}`.toLowerCase();

  if (normalized.includes("cooldown") || normalized.includes("rate") || normalized.includes("retry")) {
    return "cooldown";
  }
  if (normalized.includes("expired")) {
    return "expired";
  }
  if (normalized.includes("attempt") || normalized.includes("exhaust")) {
    return "attempts_exhausted";
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
    case "cooldown":
      return "Please wait before requesting another verification code.";
    case "expired":
      return "Your verification code has expired. Request a new code and try again.";
    case "attempts_exhausted":
      return "Too many incorrect attempts. Request a new verification code.";
    case "validation":
      return "Invalid verification code. Check the code and try again.";
    case "service":
      return "Verification email service is currently unavailable. Please try again later.";
    default:
      return "Something went wrong. Please try again.";
  }
}

export function normalizeOtpError(error: unknown, fallbackMessage = "Something went wrong. Please try again."): NormalizedOtpError {
  const apiError = error as {
    response?: {
      headers?: Record<string, unknown>;
      data?: ApiEnvelope<OtpResponseData>;
      status?: number;
    };
    message?: string;
  };

  const responseData = apiError.response?.data;
  const errorData = responseData?.data;
  const retryAfterHeader = apiError.response?.headers?.["retry-after"];
  const cooldownSeconds = extractCooldownSeconds(errorData, retryAfterHeader);
  const kind = getErrorKind(responseData?.code ?? responseData?.errorCode, responseData?.message ?? apiError.message);
  const message = responseData?.message ?? (kind === "unknown" ? fallbackMessage : getDefaultOtpMessage(kind));

  return {
    kind,
    message,
    cooldownSeconds,
  };
}

export async function requestOtp(payload: OtpRequestPayload): Promise<OtpRequestResult> {
  const response = await apiClient.post<ApiEnvelope<OtpResponseData>>("/auth/otp/request", payload);
  const responseData = response.data;

  return {
    message: responseData?.message,
    cooldownSeconds: extractCooldownSeconds(responseData?.data),
  };
}

export async function verifyOtp(payload: OtpVerifyPayload): Promise<void> {
  await apiClient.post("/auth/otp/verify", payload);
}

export async function resetPassword(payload: ForgotPasswordResetPayload): Promise<void> {
  await apiClient.post("/auth/forgot-password/reset", payload);
}

export async function changeEmail(payload: ChangeEmailPayload): Promise<void> {
  await apiClient.put("/auth/me/email", payload);
}

export async function changePassword(payload: ChangePasswordPayload): Promise<void> {
  await apiClient.put("/auth/me/password", payload);
}
