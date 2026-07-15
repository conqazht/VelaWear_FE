import { useState, useEffect, useCallback } from "react";
import { normalizeOtpError, requestOtp, verifyOtp, OtpPurpose } from "@/lib/auth-otp-api";
import { useI18n } from "@/components/providers/i18n-provider";

interface UseOtpFlowProps {
  email: string;
  purpose: OtpPurpose;
  onVerifySuccess?: () => Promise<void> | void;
}

export function useOtpFlow({ email, purpose, onVerifySuccess }: UseOtpFlowProps) {
  const { t } = useI18n();
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // Returns true on success, false on failure — so callers can conditionally proceed
  const handleRequestOtp = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      setIsSubmitting(true);
      const result = await requestOtp({ email, purpose });
      setShowOtpStep(true);
      setCooldown(result.cooldownSeconds ?? 60);
      return true;
    } catch (err: unknown) {
      const normalizedError = normalizeOtpError(err, t("auth.otp.sendFailed"));
      setError(getLocalizedOtpError(normalizedError.kind, t));
      if (normalizedError.cooldownSeconds) {
        setCooldown(normalizedError.cooldownSeconds);
      }
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [email, purpose, t]);

  const handleVerifyOtp = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      try {
        setError(null);
        setIsSubmitting(true);
        await verifyOtp({ email, purpose, code: otpCode });

        // OTP verified successfully — run the post-verification action
        // Errors from onVerifySuccess are caught separately so we don't
        // display a misleading "Invalid OTP" message for unrelated failures.
        if (onVerifySuccess) {
          try {
            await onVerifySuccess();
          } catch (successErr: unknown) {
            const normalizedError = normalizeOtpError(successErr, t("auth.otp.actionFailed"));
            setError(getLocalizedOtpError(normalizedError.kind, t));
            if (normalizedError.cooldownSeconds) {
              setCooldown(normalizedError.cooldownSeconds);
            }
          }
        }
      } catch (err: unknown) {
        const normalizedError = normalizeOtpError(err, t("auth.otp.invalid"));
        setError(getLocalizedOtpError(normalizedError.kind, t));
        if (normalizedError.cooldownSeconds) {
          setCooldown(normalizedError.cooldownSeconds);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, purpose, otpCode, onVerifySuccess, t]
  );

  const resetFlow = useCallback(() => {
    setShowOtpStep(false);
    setOtpCode("");
    setError(null);
  }, []);

  return {
    showOtpStep,
    setShowOtpStep,
    otpCode,
    setOtpCode,
    cooldown,
    isSubmitting,
    error,
    setError,
    handleRequestOtp,
    handleVerifyOtp,
    resetFlow,
  };
}

function getLocalizedOtpError(
  kind: ReturnType<typeof normalizeOtpError>["kind"],
  t: ReturnType<typeof useI18n>["t"],
) {
  switch (kind) {
    case "cooldown":
      return t("auth.otp.cooldownError");
    case "expired":
      return t("auth.otp.expiredError");
    case "attempts_exhausted":
      return t("auth.otp.attemptsError");
    case "validation":
      return t("auth.otp.validationError");
    case "service":
      return t("auth.otp.serviceError");
    default:
      return t("auth.otp.genericError");
  }
}
