"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import { useOtpFlow } from "@/components/auth/use-otp-flow";
import { changeEmail } from "@/lib/auth-otp-api";
import { OtpEntry } from "@/components/auth/otp-entry";
import { createEmailSchema } from "@/lib/validations";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function EditEmailModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
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
        toast.success(t("account.settings.emailUpdated"));
        await clearRevokedSession();
        handleModalClose();
        router.push("/sign-in");
      } catch (error) {
        setSubmitError(getApiErrorMessage(error));
      }
    },
  });

  const getApiErrorMessage = (error: unknown) => {
    const apiError = error as { response?: { data?: { message?: string } }; message?: string };
    return (
      apiError.response?.data?.message ?? apiError.message ?? t("account.settings.updateEmailError")
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

  if (user?.hasPassword === false) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleModalClose()}>
      <DialogContent className="bg-canvas text-ink max-w-[500px] rounded-md border-[#e3dccf] p-6 shadow-2xl md:p-8">
        <DialogHeader className="mb-4 text-left">
          <DialogTitle className="text-ink font-serif text-2xl font-light tracking-tight">
            {t("account.profile.email")}
          </DialogTitle>
        </DialogHeader>

        {!showOtpStep ? (
          <div className="flex flex-col gap-6">
            <p className="text-ink/70 text-sm">{t("account.profile.emailSettingsNote")}</p>
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
                  className={`peer text-ink w-full rounded-sm border bg-transparent px-4 py-3.5 text-sm placeholder-transparent transition-colors duration-500 ease-out focus:outline-none ${
                    emailTouched && !isFormValid
                      ? "border-error focus:border-error"
                      : "focus:border-ink/60 border-[#1c1a18]/20"
                  }`}
                />
                <label
                  htmlFor="newEmail"
                  className={`bg-canvas absolute -top-2 left-3 cursor-text px-1 text-xs transition-all duration-300 ease-out peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4 peer-placeholder-shown:text-sm peer-focus:-top-2 peer-focus:left-3 peer-focus:text-xs ${
                    emailTouched && !isFormValid
                      ? "text-error peer-focus:text-error"
                      : "text-ink/70 peer-focus:text-ink/70"
                  }`}
                >
                  {t("account.profile.email")}
                </label>
              </div>
              {emailTouched && !isFormValid && (
                <p className="text-error mt-1.5 text-xs transition-opacity duration-500">
                  {emailValidationMessage}
                </p>
              )}
            </div>

            {displayError && <p className="text-error text-sm">{displayError}</p>}

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={handleNext}
                disabled={!isFormValid || isOtpSubmitting}
                className={`flex items-center justify-center gap-2 rounded-sm border px-8 py-2.5 text-sm font-medium transition-colors ${
                  isFormValid && !isOtpSubmitting
                    ? "cursor-pointer border-[#1c1a18] bg-[#1c1a18] text-white shadow-sm hover:bg-[#1c1a18]/90"
                    : "text-ink/40 pointer-events-none cursor-not-allowed border-[#1c1a18]/20 bg-transparent"
                }`}
              >
                {isOtpSubmitting && <Loader2 className="size-4 animate-spin" />}
                <span>{t("account.settings.verifyEmail")}</span>
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
