import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { OtpEntry } from "./otp-entry";

vi.mock("@/components/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      if (key === "auth.otp.sent") return `Code sent to ${params?.email}`;
      if (key === "auth.otp.prompt") return `Enter code sent to ${params?.email}`;
      if (key === "auth.otp.resendIn") return `Resend in ${params?.seconds}s`;
      return key;
    },
  }),
}));

describe("OtpEntry - Segmented InputOTP", () => {
  const defaultProps = {
    email: "user@velawear.local",
    otpCode: "",
    setOtpCode: vi.fn(),
    cooldown: 0,
    isSubmitting: false,
    error: null,
    onVerify: vi.fn((e) => e.preventDefault()),
    onResend: vi.fn(),
    onCancel: vi.fn(),
    inline: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("renders 6 individual slots and separator", () => {
    const { container } = render(<OtpEntry {...defaultProps} />);

    const slots = container.querySelectorAll('[data-slot="input-otp-slot"]');
    expect(slots).toHaveLength(6);

    const separator = container.querySelector('[data-slot="input-otp-separator"]');
    expect(separator).toBeInTheDocument();
  });

  it("displays characters in the respective slots when otpCode is provided", () => {
    const { container } = render(<OtpEntry {...defaultProps} otpCode="984210" />);

    const slots = container.querySelectorAll('[data-slot="input-otp-slot"]');
    expect(slots[0]).toHaveTextContent("9");
    expect(slots[1]).toHaveTextContent("8");
    expect(slots[2]).toHaveTextContent("4");
    expect(slots[3]).toHaveTextContent("2");
    expect(slots[4]).toHaveTextContent("1");
    expect(slots[5]).toHaveTextContent("0");
  });

  it("calls setOtpCode when digits are entered", () => {
    const setOtpCodeMock = vi.fn();
    render(<OtpEntry {...defaultProps} setOtpCode={setOtpCodeMock} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "1" } });

    expect(setOtpCodeMock).toHaveBeenCalledWith("1");
  });

  it("supports pasting full 6-digit code via clipboard paste", () => {
    const setOtpCodeMock = vi.fn();
    render(<OtpEntry {...defaultProps} setOtpCode={setOtpCodeMock} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "654321" } });

    expect(setOtpCodeMock).toHaveBeenCalledWith("654321");
  });

  it("disables submit button when otpCode length is less than 6", () => {
    render(<OtpEntry {...defaultProps} otpCode="123" />);

    const submitBtn = screen.getByRole("button", { name: "auth.otp.verifyContinue" });
    expect(submitBtn).toBeDisabled();
  });

  it("enables submit button when all 6 digits are filled", () => {
    render(<OtpEntry {...defaultProps} otpCode="123456" />);

    const submitBtn = screen.getByRole("button", { name: "auth.otp.verifyContinue" });
    expect(submitBtn).not.toBeDisabled();
  });

  it("shows loading state when isSubmitting is true", () => {
    render(<OtpEntry {...defaultProps} otpCode="123456" isSubmitting={true} />);

    expect(screen.getByText("auth.otp.verifying")).toBeInTheDocument();
    const submitBtn = screen.getByRole("button", { name: /auth\.otp\.verifying/ });
    expect(submitBtn).toBeDisabled();
  });

  it("renders error message when error prop is provided", () => {
    render(<OtpEntry {...defaultProps} error="Mã OTP không hợp lệ" />);

    expect(screen.getByText("Mã OTP không hợp lệ")).toBeInTheDocument();
  });

  it("handles resend click when cooldown is 0", () => {
    const onResendMock = vi.fn();
    render(<OtpEntry {...defaultProps} onResend={onResendMock} />);

    const resendBtn = screen.getByRole("button", { name: "auth.otp.resend" });
    fireEvent.click(resendBtn);

    expect(onResendMock).toHaveBeenCalledTimes(1);
  });

  it("disables resend button during cooldown", () => {
    render(<OtpEntry {...defaultProps} cooldown={45} />);

    const resendBtn = screen.getByRole("button", { name: "Resend in 45s" });
    expect(resendBtn).toBeDisabled();
  });
});
