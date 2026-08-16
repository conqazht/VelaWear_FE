"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import { useOtpFlow } from "@/components/auth/use-otp-flow";
import { changeEmail } from "@/lib/auth-otp-api";
import { OtpEntry } from "@/components/auth/otp-entry";
import { createEmailSchema } from "@/lib/validations";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function EditEmailModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { user, clearRevokedSession } = useAuth();
  const { t, locale } = useI18n();

  const [newEmail, setNewEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const emailValidation = createEmailSchema(locale).safeParse(newEmail);
  const isEmailValid = emailValidation.success;
  const isSameAsCurrent = Boolean(
    user?.email && newEmail.trim().toLowerCase() === user.email.trim().toLowerCase(),
  );

  const emailValidationMessage = !newEmail.trim()
    ? t("account.profile.emailRequired")
    : isSameAsCurrent
      ? t("account.settings.emailSameAsCurrent")
      : emailValidation.success
        ? null
        : (emailValidation.error.issues[0]?.message ?? t("account.profile.emailInvalid"));

  const isFormValid = isEmailValid && !isSameAsCurrent;

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
        await clearRevokedSession();
        handleModalClose();
      } catch (error) {
        setSubmitError(getApiErrorMessage(error));
      }
    },
  });

  const getApiErrorMessage = (error: unknown) => {
    const apiError = error as { response?: { data?: { message?: string } }; message?: string };
    return (
      apiError.response?.data?.message ??
      apiError.message ??
      t("account.settings.updateEmailError")
    );
  };

  const handleNext = async () => {
    setSubmitError(null);
    if (!isFormValid) {
      setEmailTouched(true);
      return;
    }
    await handleRequestOtp();
  };

  const handleModalClose = () => {
    resetFlow();
    setNewEmail("");
    setEmailTouched(false);
    setSubmitError(null);
    onClose();
  };

  const displayError = submitError || otpError;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleModalClose()}>
      <DialogContent className="max-w-[500px] rounded-md border-[#e3dccf] bg-canvas p-6 md:p-8 text-ink shadow-2xl">
        <DialogHeader className="mb-4 text-left">
          <DialogTitle className="text-2xl font-serif font-light text-ink tracking-tight">
            {t("account.profile.email")}
          </DialogTitle>
        </DialogHeader>

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
                    setSubmitError(null);
                  }}
                  onBlur={() => setEmailTouched(true)}
                  className={`peer w-full px-4 py-3.5 rounded-sm border bg-transparent text-sm text-ink placeholder-transparent focus:outline-none transition-colors duration-500 ease-out ${
                    emailTouched && !isFormValid
                      ? "border-error focus:border-error"
                      : "border-[#1c1a18]/20 focus:border-ink/60"
                  }`}
                />
                <label
                  htmlFor="newEmail"
                  className={`absolute left-3 -top-2 bg-canvas px-1 text-xs transition-all duration-300 ease-out peer-placeholder-shown:text-sm peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4 peer-focus:-top-2 peer-focus:left-3 peer-focus:text-xs cursor-text ${
                    emailTouched && !isFormValid
                      ? "text-error peer-focus:text-error"
                      : "text-ink/70 peer-focus:text-ink/70"
                  }`}
                >
                  {t("account.profile.email")}
                </label>
              </div>
              {emailTouched && !isFormValid && (
                <p className="text-error text-xs mt-1.5 transition-opacity duration-500">
                  {emailValidationMessage}
                </p>
              )}
            </div>

            {displayError && (
              <p className="text-sm text-error">{displayError}</p>
            )}

            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={handleNext}
                disabled={!isFormValid || isOtpSubmitting}
                className={`px-8 py-2.5 rounded-sm border text-sm font-medium transition-colors cursor-pointer ${
                  isFormValid && !isOtpSubmitting
                    ? "bg-[#1c1a18] text-white border-[#1c1a18] hover:bg-[#1c1a18]/90 shadow-sm"
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
              error={displayError}
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
      </DialogContent>
    </Dialog>
  );
}
