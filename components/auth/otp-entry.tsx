"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { useI18n } from "@/components/providers/i18n-provider";
import { BrandMark } from "@/components/shop/brand-mark";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
  REGEXP_ONLY_DIGITS,
} from "@/components/ui/input-otp";
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
  plain?: boolean;
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
  cancelLabel,
  actionLabel,
  inline = false,
  plain = false,
  children,
}: OtpEntryProps) {
  const { t } = useI18n();
  const resolvedCancelLabel = cancelLabel ?? t("auth.otp.changeEmail");
  const resolvedActionLabel = actionLabel ?? t("auth.otp.verifyContinue");

  const formContent = (
    <form onSubmit={onVerify} className="flex flex-col gap-6">
      {error && (
        <div className="rounded-[12px] border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-col items-center gap-3">
        <label
          htmlFor="otpCode"
          className="text-center text-xs font-semibold tracking-wider text-[#55423d] uppercase select-none"
        >
          {t("auth.otp.verificationCode")}
        </label>
        <div className="flex w-full justify-center">
          <InputOTP
            id="otpCode"
            maxLength={6}
            value={otpCode}
            onChange={(val) => setOtpCode(val)}
            pattern={REGEXP_ONLY_DIGITS}
            disabled={isSubmitting}
            autoFocus
            aria-invalid={Boolean(error)}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
      </div>

      {children}

      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={onCancel}
          className="cursor-pointer border-0 bg-transparent text-[#55423d] underline hover:text-[#b5573a]"
        >
          {resolvedCancelLabel}
        </button>
        <button
          type="button"
          disabled={cooldown > 0 || isSubmitting}
          onClick={onResend}
          className="cursor-pointer border-0 bg-transparent text-[#b5573a] hover:underline disabled:no-underline disabled:opacity-50"
        >
          {cooldown > 0 ? t("auth.otp.resendIn", { seconds: cooldown }) : t("auth.otp.resend")}
        </button>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting || otpCode.length < 6}
          className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-[12px] bg-[#b5573a] text-sm font-medium tracking-wider text-white uppercase shadow-sm transition-all duration-150 ease-out hover:bg-[#8f4329] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>{t("auth.otp.verifying")}</span>
            </>
          ) : (
            resolvedActionLabel
          )}
        </button>
      </div>
    </form>
  );

  if (plain) {
    return formContent;
  }

  const content = (
    <div
      className={cn(
        "w-full text-left",
        !inline && "max-w-[460px] rounded-[16px] bg-[#efe7dc] p-6 md:p-8",
      )}
    >
      {!inline && (
        <div className="mb-6 text-center">
          <Link
            href="/"
            aria-label={t("auth.common.homeAria")}
            className="inline-block transition-opacity hover:opacity-90"
          >
            <BrandMark className="mx-auto" />
          </Link>
          <h1 className="mt-3 font-serif text-[32px] leading-[1.18] tracking-[-0.0125em] text-[#1c1a18]">
            {t("auth.otp.title")}
          </h1>
          <p className="mt-2 text-sm leading-[1.55] text-[#55423d]">
            {t("auth.otp.sent", { email })}
          </p>
        </div>
      )}

      {inline && <p className="mb-2 text-xs text-[#55423d]">{t("auth.otp.prompt", { email })}</p>}

      {formContent}
    </div>
  );

  if (inline) {
    return (
      <div className="border-hairline/60 mt-2 rounded-[12px] border bg-[#efe7dc]/30 p-5">
        {content}
      </div>
    );
  }

  return (
    <AuthShell className="flex min-h-screen items-start justify-center px-4 pt-4 pb-20 md:pt-8">
      {content}
    </AuthShell>
  );
}
