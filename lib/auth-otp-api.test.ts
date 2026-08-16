import { beforeEach, describe, expect, it, vi } from "vitest";

const apiClientMocks = vi.hoisted(() => ({
  post: vi.fn(),
  put: vi.fn(),
}));

vi.mock("@/lib/api-client", () => ({
  default: apiClientMocks,
}));

import {
  changeEmail,
  normalizeOtpError,
  requestOtp,
  resetPassword,
  verifyOtp,
  type OtpErrorCode,
  type OtpErrorKind,
} from "@/lib/auth-otp-api";

describe("auth OTP API contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("nhận challenge từ request và verify chỉ bằng challengeId + code", async () => {
    apiClientMocks.post
      .mockResolvedValueOnce({
        data: {
          data: {
            challengeId: "challenge-1",
            expiresInSeconds: 300,
            cooldownSeconds: 60,
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          data: {
            proofToken: "proof-1",
            expiresInSeconds: 300,
          },
        },
      });

    await expect(requestOtp({ email: "member@example.com", purpose: "REGISTER" })).resolves.toEqual(
      {
        challengeId: "challenge-1",
        expiresInSeconds: 300,
        cooldownSeconds: 60,
      },
    );
    await expect(verifyOtp({ challengeId: "challenge-1", code: "123456" })).resolves.toEqual({
      proofToken: "proof-1",
      expiresInSeconds: 300,
    });

    expect(apiClientMocks.post).toHaveBeenNthCalledWith(1, "/auth/otp/request", {
      email: "member@example.com",
      purpose: "REGISTER",
    });
    expect(apiClientMocks.post).toHaveBeenNthCalledWith(2, "/auth/otp/verify", {
      challengeId: "challenge-1",
      code: "123456",
    });
  });

  it("gửi proof token trong các final action", async () => {
    const result = {
      allSessionsRevoked: true,
      reauthenticationRequired: true,
    };
    apiClientMocks.post.mockResolvedValueOnce({ data: { data: result } });
    apiClientMocks.put.mockResolvedValueOnce({ data: { data: result } });

    await expect(
      resetPassword({
        email: "member@example.com",
        newPassword: "NewPassword1",
        otpProofToken: "reset-proof",
      }),
    ).resolves.toEqual(result);
    await expect(
      changeEmail({
        newEmail: "new@example.com",
        otpProofToken: "email-proof",
      }),
    ).resolves.toEqual(result);

    expect(apiClientMocks.post).toHaveBeenCalledWith("/auth/forgot-password/reset", {
      email: "member@example.com",
      newPassword: "NewPassword1",
      otpProofToken: "reset-proof",
    });
    expect(apiClientMocks.put).toHaveBeenCalledWith("/auth/me/email", {
      newEmail: "new@example.com",
      otpProofToken: "email-proof",
    });
  });

  it.each<[OtpErrorCode, OtpErrorKind]>([
    ["OTP_INVALID_OR_EXPIRED", "invalid_or_expired"],
    ["OTP_ATTEMPTS_EXHAUSTED", "attempts_exhausted"],
    ["OTP_RATE_LIMITED", "rate_limited"],
    ["OTP_PROOF_INVALID_OR_EXPIRED", "proof_invalid_or_expired"],
    ["AUTH_RATE_LIMITED", "rate_limited"],
    ["SESSION_REVOKED", "session_revoked"],
    ["OTP_SERVICE_UNAVAILABLE", "service"],
    ["OTP_DELIVERY_UNAVAILABLE", "service"],
  ])("map mã lỗi ổn định %s", (code, expectedKind) => {
    expect(
      normalizeOtpError({
        response: {
          data: {
            code,
            message: "Thông điệp có thể được dịch từ backend",
          },
        },
      }),
    ).toMatchObject({ code, kind: expectedKind });
  });

  it("ưu tiên retryAfterSeconds trong body và đọc được Retry-After header", () => {
    expect(
      normalizeOtpError({
        response: {
          headers: { "retry-after": "90" },
          data: {
            code: "OTP_RATE_LIMITED",
            data: { retryAfterSeconds: 45 },
          },
        },
      }).retryAfterSeconds,
    ).toBe(45);

    expect(
      normalizeOtpError({
        response: {
          headers: { get: () => "90" },
          data: { code: "AUTH_RATE_LIMITED" },
        },
      }).retryAfterSeconds,
    ).toBe(90);
  });

  it("không đoán mã lỗi từ text của message nữa", () => {
    expect(
      normalizeOtpError({
        response: { status: 400, data: { message: "rate limit exceeded" } },
      }).kind,
    ).toBe("unknown");

    expect(
      normalizeOtpError({
        response: { status: 400, data: { code: "SOME_UNKNOWN_CODE", message: "expired OTP" } },
      }).kind,
    ).toBe("unknown");

    expect(
      normalizeOtpError({
        response: { status: 429, data: { message: "random text" } },
      }).kind,
    ).toBe("rate_limited");

    expect(
      normalizeOtpError({
        response: { status: 401, data: { message: "random text" } },
      }).kind,
    ).toBe("session_revoked");

    expect(
      normalizeOtpError({
        response: { status: 503, data: { message: "random text" } },
      }).kind,
    ).toBe("service");
  });

  it("fail closed khi response mới thiếu challenge/proof", async () => {
    apiClientMocks.post
      .mockResolvedValueOnce({ data: { data: { expiresInSeconds: 300, cooldownSeconds: 60 } } })
      .mockResolvedValueOnce({ data: { data: { expiresInSeconds: 300 } } });

    await expect(requestOtp({ email: "member@example.com", purpose: "REGISTER" })).rejects.toThrow(
      "missing challengeId",
    );
    await expect(verifyOtp({ challengeId: "challenge", code: "123456" })).rejects.toThrow(
      "missing proofToken",
    );
  });
});
