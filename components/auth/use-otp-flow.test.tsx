import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NormalizedOtpError } from "@/lib/auth-otp-api";

const otpApiMocks = vi.hoisted(() => ({
  requestOtp: vi.fn(),
  verifyOtp: vi.fn(),
  normalizeOtpError: vi.fn<() => NormalizedOtpError>(() => ({
    kind: "unknown" as const,
    message: "error",
  })),
}));

vi.mock("@/lib/auth-otp-api", () => otpApiMocks);
vi.mock("@/components/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

import { useOtpFlow } from "@/components/auth/use-otp-flow";

describe("useOtpFlow proof-token flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    otpApiMocks.normalizeOtpError.mockReturnValue({
      kind: "unknown",
      message: "error",
    });
  });

  it("giữ challenge trong memory và chỉ truyền proof vào callback cuối", async () => {
    otpApiMocks.requestOtp.mockResolvedValue({
      challengeId: "challenge-1",
      expiresInSeconds: 300,
      cooldownSeconds: 60,
    });
    otpApiMocks.verifyOtp.mockResolvedValue({
      proofToken: "one-time-proof",
      expiresInSeconds: 300,
    });
    const onVerifySuccess = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useOtpFlow({
        email: "member@example.com",
        purpose: "REGISTER",
        onVerifySuccess,
      }),
    );

    await act(async () => {
      await expect(result.current.handleRequestOtp()).resolves.toBe(true);
    });
    act(() => result.current.setOtpCode("123456"));
    await act(async () => {
      await expect(result.current.handleVerifyOtp()).resolves.toBe(true);
    });

    expect(otpApiMocks.verifyOtp).toHaveBeenCalledWith({
      challengeId: "challenge-1",
      code: "123456",
    });
    expect(onVerifySuccess).toHaveBeenCalledWith("one-time-proof");
    expect(result.current).not.toHaveProperty("proofToken");
    expect(result.current).not.toHaveProperty("challengeId");
  });

  it("resend thay challenge cũ trước khi verify", async () => {
    otpApiMocks.requestOtp
      .mockResolvedValueOnce({
        challengeId: "old-challenge",
        expiresInSeconds: 300,
        cooldownSeconds: 60,
      })
      .mockResolvedValueOnce({
        challengeId: "new-challenge",
        expiresInSeconds: 300,
        cooldownSeconds: 60,
      });
    otpApiMocks.verifyOtp.mockResolvedValue({
      proofToken: "new-proof",
      expiresInSeconds: 300,
    });
    const { result } = renderHook(() =>
      useOtpFlow({ email: "member@example.com", purpose: "FORGOT_PASSWORD" }),
    );

    await act(async () => {
      await result.current.handleRequestOtp();
      await result.current.handleRequestOtp();
    });
    act(() => result.current.setOtpCode("654321"));
    await act(async () => {
      await result.current.handleVerifyOtp();
    });

    expect(otpApiMocks.verifyOtp).toHaveBeenCalledWith({
      challengeId: "new-challenge",
      code: "654321",
    });
  });

  it("áp dụng retryAfterSeconds của limiter vào cooldown", async () => {
    otpApiMocks.requestOtp.mockRejectedValue(new Error("rate limited"));
    otpApiMocks.normalizeOtpError.mockReturnValue({
      code: "OTP_RATE_LIMITED",
      kind: "rate_limited",
      message: "rate limited",
      retryAfterSeconds: 37,
    });
    const { result } = renderHook(() =>
      useOtpFlow({ email: "member@example.com", purpose: "REGISTER" }),
    );

    await act(async () => {
      await expect(result.current.handleRequestOtp()).resolves.toBe(false);
    });

    expect(result.current.cooldown).toBe(37);
    expect(result.current.error).toBe("auth.otp.cooldownError");
  });

  it("reset flow xóa challenge nên không thể verify lại", async () => {
    otpApiMocks.requestOtp.mockResolvedValue({
      challengeId: "challenge-to-clear",
      expiresInSeconds: 300,
      cooldownSeconds: 60,
    });
    const { result } = renderHook(() =>
      useOtpFlow({ email: "member@example.com", purpose: "REGISTER" }),
    );

    await act(async () => {
      await result.current.handleRequestOtp();
    });
    act(() => {
      result.current.setOtpCode("123456");
      result.current.resetFlow();
    });
    await act(async () => {
      await expect(result.current.handleVerifyOtp()).resolves.toBe(false);
    });

    expect(otpApiMocks.verifyOtp).not.toHaveBeenCalled();
  });
});
