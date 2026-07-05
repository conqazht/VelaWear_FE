import { useState, useEffect, useCallback } from "react";
import { normalizeOtpError, requestOtp, verifyOtp, OtpPurpose } from "@/lib/auth-otp-api";

interface UseOtpFlowProps {
  email: string;
  purpose: OtpPurpose;
  onVerifySuccess?: () => Promise<void> | void;
}

export function useOtpFlow({ email, purpose, onVerifySuccess }: UseOtpFlowProps) {
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
      const normalizedError = normalizeOtpError(err, "Failed to send verification code. Please try again.");
      setError(normalizedError.message);
      if (normalizedError.cooldownSeconds) {
        setCooldown(normalizedError.cooldownSeconds);
      }
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [email, purpose]);

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
            const normalizedError = normalizeOtpError(successErr, "An error occurred. Please try again.");
            setError(normalizedError.message);
            if (normalizedError.cooldownSeconds) {
              setCooldown(normalizedError.cooldownSeconds);
            }
          }
        }
      } catch (err: unknown) {
        const normalizedError = normalizeOtpError(err, "Invalid or expired verification code.");
        setError(normalizedError.message);
        if (normalizedError.cooldownSeconds) {
          setCooldown(normalizedError.cooldownSeconds);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, purpose, otpCode, onVerifySuccess]
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
