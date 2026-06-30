"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { Eye, EyeOff, Check } from "lucide-react";

import { AuthShell } from "@/components/auth/auth-shell";
import { BrandMark } from "@/components/shop/brand-mark";
import { FloatingInput } from "@/components/auth/floating-input";
import { resetPassword } from "@/lib/auth-otp-api";
import { useOtpFlow } from "@/components/auth/use-otp-flow";
import { OtpEntry } from "@/components/auth/otp-entry";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<"REQUEST" | "VERIFY" | "SUCCESS">("REQUEST");

  const passwordRef = useRef<HTMLInputElement>(null);

  const {
    showOtpStep,
    otpCode,
    setOtpCode,
    cooldown,
    isSubmitting,
    error,
    setError,
    handleRequestOtp,
    handleVerifyOtp,
    resetFlow,
  } = useOtpFlow({
    email,
    purpose: "FORGOT_PASSWORD",
    onVerifySuccess: async () => {
      // Password was already validated before calling verify (see handleResetSubmit).
      // At this point, OTP is verified — proceed with the reset.
      await resetPassword({ email, newPassword });
      setStep("SUCCESS");
    },
  });

  const handleRequestInit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await handleRequestOtp();
    if (success) {
      setStep("VERIFY");
    }
  };

  // Validates password BEFORE consuming the OTP, then delegates to verify+reset.
  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setError("Password must contain uppercase and lowercase letters and at least one number.");
      return;
    }

    // Password is valid — now verify OTP and reset
    handleVerifyOtp();
  };

  const handleCancel = () => {
    resetFlow();
    setStep("REQUEST");
  };

  if (step === "SUCCESS") {
    return (
      <AuthShell className="flex min-h-screen items-start justify-center px-4 pt-4 pb-20 md:pt-8">
        <section className="w-full max-w-[448px] bg-[#efe7dc] p-6 md:p-8 text-center rounded">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
            <Check className="h-8 w-8" />
          </div>
          <h1 className="font-serif text-[32px] leading-[1.18] tracking-[-0.0125em] text-[#1c1a18] mb-3">
            Password Reset
          </h1>
          <p className="text-sm leading-[1.55] text-[#55423d] mb-8">
            Your password has been successfully reset. You can now sign in with your new password.
          </p>
          <Link
            href="/sign-in"
            className="inline-flex h-14 w-full items-center justify-center rounded-sm bg-[#964025] text-sm font-medium tracking-wider text-white hover:bg-[#87391f] transition-colors uppercase"
          >
            Go to Sign In
          </Link>
        </section>
      </AuthShell>
    );
  }

  if (showOtpStep && step === "VERIFY") {
    return (
      <OtpEntry
        email={email}
        otpCode={otpCode}
        setOtpCode={setOtpCode}
        cooldown={cooldown}
        isSubmitting={isSubmitting}
        error={error}
        onVerify={handleResetSubmit}
        onResend={handleRequestOtp}
        onCancel={handleCancel}
        cancelLabel="Change email"
        actionLabel="Reset Password"
      >
        <FloatingInput
          id="newPassword"
          label="New Password*"
          type={showPassword ? "text" : "password"}
          value={newPassword}
          inputRef={passwordRef}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          trailing={
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setShowPassword(!showPassword);
                setTimeout(() => {
                  passwordRef.current?.focus();
                }, 0);
              }}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="p-1 hover:opacity-85 transition-opacity cursor-pointer bg-transparent border-0"
            >
              {showPassword ? <EyeOff className="size-[22px] text-ink" /> : <Eye className="size-[22px] text-ink" />}
            </button>
          }
        />
      </OtpEntry>
    );
  }

  return (
    <AuthShell className="flex min-h-screen items-start justify-center px-4 pt-4 pb-20 md:pt-8">
      <section className="w-full max-w-[448px] bg-[#efe7dc] p-6 md:p-8 rounded">
        <div className="mb-6 text-center">
          <Link href="/" className="inline-block transition-opacity hover:opacity-90">
            <BrandMark className="mx-auto" />
          </Link>
          <h1 className="mt-3 font-serif text-[32px] leading-[1.18] tracking-[-0.0125em] text-[#1c1a18]">
            Reset Password
          </h1>
          <p className="mt-2 text-sm leading-[1.55] text-[#55423d]">
            Enter your email to request a verification code.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-700 text-sm rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleRequestInit} className="space-y-6">
          <FloatingInput
            id="email"
            label="Email Address*"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-14 bg-[#964025] text-white rounded-sm font-medium hover:bg-[#87391f] transition-colors flex items-center justify-center cursor-pointer text-sm uppercase tracking-wider disabled:opacity-50"
          >
            {isSubmitting ? "Requesting..." : "Send Verification Code"}
          </button>
          <div className="text-center mt-6">
            <Link href="/sign-in" className="text-sm text-[#55423d] hover:text-[#964025] underline">
              Back to Sign In
            </Link>
          </div>
        </form>
      </section>
    </AuthShell>
  );
}
