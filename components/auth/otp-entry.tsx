"use client";

import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { BrandMark } from "@/components/shop/brand-mark";
import { FloatingInput } from "@/components/auth/floating-input";
import { cn } from "@/lib/utils";

interface OtpEntryProps {
  email: string;
  otpCode: string;
  setOtpCode: (code: string) => void;
  cooldown: number;
  isSubmitting: boolean;
  error: string | null;
  onVerify: (e: React.FormEvent) => void;
  onResend: () => void;
  onCancel: () => void;
  cancelLabel?: string;
  actionLabel?: string;
  inline?: boolean;
  children?: React.ReactNode;
}

export function OtpEntry({
  email,
  otpCode,
  setOtpCode,
  cooldown,
  isSubmitting,
  error,
  onVerify,
  onResend,
  onCancel,
  cancelLabel = "Change email",
  actionLabel = "Verify & Continue",
  inline = false,
  children,
}: OtpEntryProps) {
  const content = (
    <div className={cn("w-full text-left", !inline && "max-w-[460px] bg-[#efe7dc] p-6 md:p-8 rounded")}>
      {!inline && (
        <div className="mb-6 text-center">
          <Link href="/" className="inline-block transition-opacity hover:opacity-90">
            <BrandMark className="mx-auto" />
          </Link>
          <h1 className="mt-3 font-serif text-[32px] leading-[1.18] tracking-[-0.0125em] text-[#1c1a18]">
            Verify your Email
          </h1>
          <p className="mt-2 text-sm leading-[1.55] text-[#55423d]">
            We sent a 6-digit verification code to <span className="font-semibold">{email}</span>.
          </p>
        </div>
      )}

      {inline && (
        <p className="text-xs text-[#55423d] mb-2">
          Please enter the 6-digit verification code sent to <span className="font-semibold">{email}</span>.
        </p>
      )}

      <form onSubmit={onVerify} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-700 text-sm rounded">
            {error}
          </div>
        )}

        <FloatingInput
          id="otpCode"
          label="Verification Code*"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={otpCode}
          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
          required
        />

        {children}

        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={onCancel}
            className="text-[#55423d] hover:text-[#964025] underline cursor-pointer bg-transparent border-0"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={cooldown > 0 || isSubmitting}
            onClick={onResend}
            className="text-[#964025] hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer bg-transparent border-0"
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Code"}
          </button>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-14 bg-[#964025] text-white rounded-sm font-medium hover:bg-[#87391f] transition-colors flex items-center justify-center cursor-pointer text-sm uppercase tracking-wider disabled:opacity-50"
          >
            {isSubmitting ? "Verifying..." : actionLabel}
          </button>
        </div>
      </form>
    </div>
  );

  if (inline) {
    return <div className="p-5 border border-hairline/60 rounded bg-[#efe7dc]/30 mt-2">{content}</div>;
  }

  return (
    <AuthShell className="flex min-h-screen items-start justify-center px-4 pt-4 pb-20 md:pt-8">
      {content}
    </AuthShell>
  );
}
