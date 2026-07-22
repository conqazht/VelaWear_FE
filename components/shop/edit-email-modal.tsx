"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import { useOtpFlow } from "@/components/auth/use-otp-flow";
import { changeEmail } from "@/lib/api/auth";
import { OtpEntry } from "@/components/auth/otp-entry";
import { createEmailSchema } from "@/lib/validations";

export function EditEmailModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { redirectAfterRevocation } = useAuth();
  const { t, locale } = useI18n();

  const [newEmail, setNewEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const emailValidation = createEmailSchema(locale).safeParse(newEmail);
  const isEmailValid = emailValidation.success;
  const emailValidationMessage = emailValidation.success
    ? null
    : emailValidation.error.issues[0]?.message;

  const {
    showOtpStep,
    otpCode,
    setOtpCode,
    cooldown,
    isSubmitting: isOtpSubmitting,
    error: otpError,
    handleRequestOtp,
    handleVerifyOtp,
    resetFlow,
  } = useOtpFlow({
    email: newEmail,
    purpose: "CHANGE_EMAIL",
    onVerifySuccess: async (proofToken) => {
      try {
        await changeEmail({
          newEmail,
          otpProofToken: proofToken,
        });
        await redirectAfterRevocation();
        onClose();
      } catch (error) {
        setSubmitError(getApiErrorMessage(error));
      }
    },
  });

  if (!isOpen) return null;

  const getApiErrorMessage = (error: unknown) => {
    const apiError = error as { response?: { data?: { message?: string } }; message?: string };
    return apiError.response?.data?.message ?? apiError.message ?? "An error occurred";
  };

  const handleNext = async () => {
    setSubmitError(null);
    if (!isEmailValid) {
      setEmailTouched(true);
      return;
    }
    const success = await handleRequestOtp();
    if (!success) {
      setSubmitError(t("account.password.updateError"));
    }
  };

  const handleModalClose = () => {
    resetFlow();
    setNewEmail("");
    setEmailTouched(false);
    setSubmitError(null);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-[#1c1a18]/40 z-50 flex items-center justify-center p-4"
      onClick={handleModalClose}
    >
      <div 
        className="bg-canvas rounded-2xl w-full max-w-[500px] p-6 md:p-8 relative shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button 
          onClick={handleModalClose}
          aria-label={t("account.password.close")}
          className="absolute top-6 right-6 p-2 bg-[#1c1a18]/5 rounded-full hover:bg-[#1c1a18]/10 transition-colors cursor-pointer"
        >
          <X className="size-5 text-ink" />
        </button>

        <h2 className="text-2xl font-serif font-light text-ink tracking-tight mb-8">
          {t("account.profile.email")}
        </h2>

        {!showOtpStep ? (
          <div className="flex flex-col gap-6">
            <p className="text-sm text-ink/70">
              {t("account.profile.emailSettingsNote")}
            </p>
            <div>
              <div className="relative">
                <input 
                  type="email"
                  id="newEmail"
                  placeholder={t("account.profile.email")}
                  value={newEmail}
                  onChange={(e) => {
                    setNewEmail(e.target.value);
                    setEmailTouched(true);
                  }}
                  onBlur={() => setEmailTouched(true)}
                  className={`peer w-full px-4 py-3.5 rounded-lg border bg-transparent text-sm text-ink placeholder-transparent focus:outline-none transition-colors duration-500 ease-out ${
                    emailTouched && !isEmailValid
                      ? "border-red-600 focus:border-red-600"
                      : "border-[#1c1a18]/20 focus:border-ink/60"
                  }`}
                />
                <label 
                  htmlFor="newEmail"
                  className={`absolute left-3 -top-2 bg-canvas px-1 text-xs transition-all duration-300 ease-out peer-placeholder-shown:text-sm peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4 peer-focus:-top-2 peer-focus:left-3 peer-focus:text-xs cursor-text ${
                    emailTouched && !isEmailValid
                      ? "text-red-600 peer-focus:text-red-600"
                      : "text-ink/70 peer-focus:text-ink/70"
                  }`}
                >
                  {t("account.profile.email")}
                </label>
              </div>
              {emailTouched && !isEmailValid && (
                <p className="text-red-600 text-xs mt-1.5 transition-opacity duration-500">{emailValidationMessage || t("account.profile.emailInvalid")}</p>
              )}
            </div>

            {submitError && (
              <p className="text-sm text-red-600">{submitError}</p>
            )}

            <div className="flex justify-end mt-4">
              <button 
                onClick={handleNext}
                disabled={!isEmailValid || isOtpSubmitting}
                className={`px-8 py-2.5 rounded-full border text-sm font-medium transition-colors cursor-pointer ${
                  isEmailValid && !isOtpSubmitting
                    ? "bg-[#1c1a18] text-white border-[#1c1a18] hover:bg-[#1c1a18]/90"
                    : "border-[#1c1a18]/20 text-ink/40 bg-transparent cursor-not-allowed pointer-events-none"
                }`}
              >
                {t("account.settings.verifyEmail")}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <OtpEntry
              inline
              email={newEmail}
              otpCode={otpCode}
              setOtpCode={setOtpCode}
              cooldown={cooldown}
              isSubmitting={isOtpSubmitting}
              error={otpError || submitError}
              onVerify={handleVerifyOtp}
              onResend={handleRequestOtp}
              onCancel={() => {
                resetFlow();
                setSubmitError(null);
              }}
              cancelLabel={t("account.settings.cancel")}
              actionLabel={t("account.settings.confirmCode")}
            />
          </div>
        )}
      </div>
    </div>
  );
}
