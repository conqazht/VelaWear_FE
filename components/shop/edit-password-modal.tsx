"use client";

import { useState } from "react";
import { X, Check } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import { createStrongPasswordSchema } from "@/lib/validations";
import { changePassword } from "@/lib/auth-otp-api";

export function EditPasswordModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { user, clearRevokedSession } = useAuth();
  const { t, locale } = useI18n();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordTouched, setPasswordTouched] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordModified, setPasswordModified] = useState({
    current: false,
    new: false,
    confirm: false
  });

  if (!isOpen) return null;

  const passwordValidation = createStrongPasswordSchema(locale).safeParse(passwordForm.newPassword);
  const isStrongPassword = passwordValidation.success;
  const passwordValidationMessage = passwordValidation.success
    ? null
    : passwordValidation.error.issues[0]?.message;

  const getApiErrorMessage = (error: unknown) => {
    const apiError = error as { response?: { data?: { message?: string } }; message?: string };
    return apiError.response?.data?.message ?? apiError.message ?? "An error occurred";
  };

  const handleSave = async () => {
    setSubmitError(null);
    try {
      setIsSubmitting(true);
      await changePassword({
        currentPassword: user?.hasPassword !== false ? passwordForm.currentPassword : undefined,
        newPassword: passwordForm.newPassword,
      });
      // Logout after password change
      await clearRevokedSession();
      onClose();
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-[#1c1a18]/40 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-canvas rounded-2xl w-full max-w-[500px] p-6 md:p-8 relative shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="password-dialog-title"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          aria-label={t("account.password.close")}
          className="absolute top-6 right-6 p-2 bg-[#1c1a18]/5 rounded-full hover:bg-[#1c1a18]/10 transition-colors cursor-pointer"
        >
          <X className="size-5 text-ink" />
        </button>

        <h2 id="password-dialog-title" className="text-2xl font-serif font-light text-ink tracking-tight mb-8">
          {user?.hasPassword !== false ? t("account.password.editTitle") : t("account.password.createTitle")}
        </h2>

        <div className="flex flex-col gap-6">
          {/* Current Password */}
          {user?.hasPassword !== false && (
          <div>
            <div className="relative">
              <input 
                type="password"
                id="currentPassword"
                placeholder={t("account.password.current")}
                value={passwordForm.currentPassword}
                onChange={(e) => {
                  setPasswordForm(prev => ({...prev, currentPassword: e.target.value}));
                  setPasswordModified(prev => ({...prev, current: true}));
                  setPasswordTouched(prev => ({...prev, current: false}));
                }}
                onBlur={() => setPasswordTouched(prev => ({...prev, current: true}))}
                className={`peer w-full px-4 py-3.5 rounded-lg border bg-transparent text-sm text-ink placeholder-transparent focus:outline-none transition-colors duration-500 ease-out ${
                  passwordTouched.current && passwordModified.current && passwordForm.currentPassword.length === 0
                    ? "border-red-600 focus:border-red-600"
                    : "border-[#1c1a18]/20 focus:border-ink/60"
                }`}
              />
              <label 
                htmlFor="currentPassword"
                className={`absolute left-3 -top-2 bg-canvas px-1 text-xs transition-all duration-300 ease-out peer-placeholder-shown:text-sm peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4 peer-focus:-top-2 peer-focus:left-3 peer-focus:text-xs cursor-text ${
                  passwordTouched.current && passwordModified.current && passwordForm.currentPassword.length === 0
                    ? "text-red-600 peer-focus:text-red-600"
                    : "text-ink/70 peer-focus:text-ink/70"
                }`}
              >
                {t("account.password.current")}
              </label>
            </div>
            {passwordTouched.current && passwordModified.current && passwordForm.currentPassword.length === 0 && (
              <p className="text-red-600 text-xs mt-1.5 transition-opacity duration-500">{t("account.password.currentRequired")}</p>
            )}
          </div>
          )}
          
          {/* New Password */}
          <div>
            <div className="relative">
              <input 
                type="password"
                id="newPassword"
                placeholder={t("account.password.new")}
                value={passwordForm.newPassword}
                onChange={(e) => {
                  setPasswordForm(prev => ({...prev, newPassword: e.target.value}));
                  setPasswordModified(prev => ({...prev, new: true}));
                  setPasswordTouched(prev => ({...prev, new: false}));
                }}
                onBlur={() => setPasswordTouched(prev => ({...prev, new: true}))}
                className={`peer w-full px-4 py-3.5 rounded-lg border bg-transparent text-sm text-ink placeholder-transparent focus:outline-none transition-colors duration-500 ease-out ${
                  passwordTouched.new && passwordModified.new && !isStrongPassword
                    ? "border-red-600 focus:border-red-600"
                    : "border-[#1c1a18]/20 focus:border-ink/60"
                }`}
              />
              <label 
                htmlFor="newPassword"
                className={`absolute left-3 -top-2 bg-canvas px-1 text-xs transition-all duration-300 ease-out peer-placeholder-shown:text-sm peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4 peer-focus:-top-2 peer-focus:left-3 peer-focus:text-xs cursor-text ${
                  passwordTouched.new && passwordModified.new && !isStrongPassword
                    ? "text-red-600 peer-focus:text-red-600"
                    : "text-ink/70 peer-focus:text-ink/70"
                }`}
              >
                {t("account.password.new")}
              </label>
            </div>
            {passwordTouched.new && passwordModified.new && !isStrongPassword && (
              <p className="text-red-600 text-xs mt-1.5 transition-opacity duration-500">{passwordValidationMessage ?? t("account.password.newRequired")}</p>
            )}
          </div>

          {/* Confirm New Password */}
          <div>
            <div className="relative">
              <input 
                type="password"
                id="confirmPassword"
                placeholder={t("account.password.confirm")}
                value={passwordForm.confirmPassword}
                onChange={(e) => {
                  setPasswordForm(prev => ({...prev, confirmPassword: e.target.value}));
                  setPasswordModified(prev => ({...prev, confirm: true}));
                  setPasswordTouched(prev => ({...prev, confirm: false}));
                }}
                onBlur={() => setPasswordTouched(prev => ({...prev, confirm: true}))}
                className={`peer w-full px-4 py-3.5 rounded-lg border bg-transparent text-sm text-ink placeholder-transparent focus:outline-none transition-colors duration-500 ease-out ${
                  passwordTouched.confirm && passwordModified.confirm && (passwordForm.confirmPassword.length === 0 || passwordForm.confirmPassword !== passwordForm.newPassword)
                    ? "border-red-600 focus:border-red-600"
                    : "border-[#1c1a18]/20 focus:border-ink/60"
                }`}
              />
              <label 
                htmlFor="confirmPassword"
                className={`absolute left-3 -top-2.5 bg-canvas px-1 text-xs transition-all duration-300 ease-out peer-placeholder-shown:text-sm peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4 peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-xs cursor-text ${
                  passwordTouched.confirm && passwordModified.confirm && (passwordForm.confirmPassword.length === 0 || passwordForm.confirmPassword !== passwordForm.newPassword)
                    ? "text-red-600 peer-focus:text-red-600"
                    : "text-ink/70 peer-focus:text-ink/70"
                }`}
              >
                {t("account.password.confirm")}
              </label>
            </div>
            {passwordTouched.confirm && passwordModified.confirm && passwordForm.confirmPassword.length > 0 && passwordForm.confirmPassword !== passwordForm.newPassword && (
              <p className="text-red-600 text-xs mt-1.5 transition-opacity duration-300">{t("account.password.mismatch")}</p>
            )}
            {passwordTouched.confirm && passwordModified.confirm && passwordForm.confirmPassword.length === 0 && (
              <p className="text-red-600 text-xs mt-1.5 transition-opacity duration-300">{t("account.password.confirmRequired")}</p>
            )}
          </div>
        </div>

        <div className="mt-8 mb-6 pl-2">
          <p className="text-ink/70 text-sm mb-2">{t("account.password.requirements")}</p>
          <div className={`flex items-center gap-2 text-sm ${isStrongPassword ? "text-green-700" : "text-ink/70"}`}>
            {isStrongPassword ? <Check className="size-4" /> : <X className="size-4" />}
            <span>{t("account.password.strongRequirement")}</span>
          </div>
        </div>

        {submitError && (
          <p className="text-sm text-red-600 mb-6">{submitError}</p>
        )}

        <div className="flex justify-end">
          <button 
            onClick={handleSave}
            disabled={
              isSubmitting ||
              (user?.hasPassword !== false 
                ? passwordForm.currentPassword.length === 0 || !isStrongPassword || passwordForm.newPassword !== passwordForm.confirmPassword
                : !isStrongPassword || passwordForm.newPassword !== passwordForm.confirmPassword)
            }
            className={`px-8 py-2.5 rounded-full border text-sm font-medium transition-colors cursor-pointer ${
              (user?.hasPassword !== false 
                ? passwordForm.currentPassword.length > 0 && isStrongPassword && passwordForm.newPassword === passwordForm.confirmPassword
                : isStrongPassword && passwordForm.newPassword === passwordForm.confirmPassword)
                ? "bg-[#1c1a18] text-white border-[#1c1a18] hover:bg-[#1c1a18]/90"
                : "border-[#1c1a18]/20 text-ink/40 bg-transparent cursor-not-allowed pointer-events-none"
            }`}
          >
            {isSubmitting 
              ? t("account.profile.saving") 
              : user?.hasPassword !== false 
                ? t("account.profile.save") 
                : t("account.password.create")}
          </button>
        </div>
      </div>
    </div>
  );
}
