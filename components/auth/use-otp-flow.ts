import { useState, useEffect, useCallback, useRef } from "react";
import { normalizeOtpError, requestOtp, verifyOtp, OtpPurpose } from "@/lib/auth-otp-api";
import { useI18n } from "@/components/providers/i18n-provider";

interface UseOtpFlowProps {
  email: string;
  purpose: OtpPurpose;
  onVerifySuccess?: (proofToken: string) => Promise<void> | void;
}

export function useOtpFlow({ email, purpose, onVerifySuccess }: UseOtpFlowProps) {
  const { t } = useI18n();
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const challengeIdRef = useRef<string | null>(null);
  const requestInFlightRef = useRef(false);
  const verificationInFlightRef = useRef(false);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // Returns true on success, false on failure — so callers can conditionally proceed
  const handleRequestOtp = useCallback(async (): Promise<boolean> => {
    if (requestInFlightRef.current || verificationInFlightRef.current) return false;

    try {
      requestInFlightRef.current = true;
      setError(null);
      setIsSubmitting(true);
      const result = await requestOtp({ email, purpose });
      challengeIdRef.current = result.challengeId;
      setShowOtpStep(true);
      setOtpCode("");
      setCooldown(result.cooldownSeconds);
      return true;
    } catch (err: unknown) {
      const normalizedError = normalizeOtpError(err, t("auth.otp.sendFailed"));
      setError(getLocalizedOtpError(normalizedError.kind, t));
      if (normalizedError.retryAfterSeconds) {
        setCooldown(normalizedError.retryAfterSeconds);
      }
      return false;
    } finally {
      requestInFlightRef.current = false;
      setIsSubmitting(false);
    }
  }, [email, purpose, t]);

  const handleVerifyOtp = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (verificationInFlightRef.current || requestInFlightRef.current) return false;

      const challengeId = challengeIdRef.current;
      if (!challengeId) {
        setError(getLocalizedOtpError("invalid_or_expired", t));
        return false;
      }

      try {
        verificationInFlightRef.current = true;
        setError(null);
        setIsSubmitting(true);
        const { proofToken } = await verifyOtp({ challengeId, code: otpCode });
        challengeIdRef.current = null;

        // Proof chỉ tồn tại trong biến cục bộ của lượt submit này. Không đưa proof
        // vào React state, storage, URL hay log vì đây là bearer credential dùng một lần.
        if (onVerifySuccess) {
          try {
            await onVerifySuccess(proofToken);
          } catch (successErr: unknown) {
            const normalizedError = normalizeOtpError(successErr, t("auth.otp.actionFailed"));
            setError(getLocalizedOtpError(normalizedError.kind, t));
            setOtpCode("");
            if (normalizedError.retryAfterSeconds) {
              setCooldown(normalizedError.retryAfterSeconds);
            }
            return false;
          }
        }
        return true;
      } catch (err: unknown) {
        const normalizedError = normalizeOtpError(err, t("auth.otp.invalid"));
        setError(getLocalizedOtpError(normalizedError.kind, t));
        if (normalizedError.kind === "attempts_exhausted") {
          challengeIdRef.current = null;
          setOtpCode("");
        }
        if (normalizedError.retryAfterSeconds) {
          setCooldown(normalizedError.retryAfterSeconds);
        }
        return false;
      } finally {
        verificationInFlightRef.current = false;
        setIsSubmitting(false);
      }
    },
    [otpCode, onVerifySuccess, t]
  );

  const resetFlow = useCallback(() => {
    challengeIdRef.current = null;
    setShowOtpStep(false);
    setOtpCode("");
    setCooldown(0);
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
    case "rate_limited":
      return t("auth.otp.cooldownError");
    case "invalid_or_expired":
      return t("auth.otp.invalid");
    case "attempts_exhausted":
      return t("auth.otp.attemptsError");
    case "proof_invalid_or_expired":
      return t("auth.otp.expiredError");
    case "session_revoked":
      return t("auth.otp.sessionRevokedError");
    case "validation":
      return t("auth.otp.validationError");
    case "service":
      return t("auth.otp.serviceError");
    default:
      return t("auth.otp.genericError");
  }
}
