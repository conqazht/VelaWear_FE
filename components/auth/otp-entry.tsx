"use client";

import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { useI18n } from "@/components/providers/i18n-provider";
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
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-700 text-sm rounded-[12px]">
          {error}
        </div>
      )}

      <FloatingInput
        id="otpCode"
        label={t("auth.otp.verificationCode")}
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
          className="text-[#55423d] hover:text-[#b5573a] underline cursor-pointer bg-transparent border-0"
        >
          {resolvedCancelLabel}
        </button>
        <button
          type="button"
          disabled={cooldown > 0 || isSubmitting}
          onClick={onResend}
          className="text-[#b5573a] hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer bg-transparent border-0"
        >
          {cooldown > 0
            ? t("auth.otp.resendIn", { seconds: cooldown })
            : t("auth.otp.resend")}
        </button>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex h-12 w-full items-center justify-center rounded-[12px] bg-[#b5573a] text-sm font-medium uppercase tracking-wider text-white transition-colors hover:bg-[#8f4329] disabled:opacity-50 cursor-pointer shadow-sm"
        >
          {isSubmitting ? t("auth.otp.verifying") : resolvedActionLabel}
        </button>
      </div>
    </form>
  );

  if (plain) {
    return formContent;
  }

  const content = (
    <div className={cn("w-full text-left", !inline && "max-w-[460px] bg-[#efe7dc] p-6 md:p-8 rounded-[16px]")}>
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

      {inline && (
        <p className="text-xs text-[#55423d] mb-2">
          {t("auth.otp.prompt", { email })}
        </p>
      )}

      {formContent}
    </div>
  );

  if (inline) {
    return <div className="p-5 border border-hairline/60 rounded-[12px] bg-[#efe7dc]/30 mt-2">{content}</div>;
  }

  return (
    <AuthShell className="flex min-h-screen items-start justify-center px-4 pt-4 pb-20 md:pt-8">
      {content}
    </AuthShell>
  );
}
