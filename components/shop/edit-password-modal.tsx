"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import { changePassword } from "@/lib/auth-otp-api";
import { PasswordRequirements } from "@/components/auth/password-requirements";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function EditPasswordModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user, clearRevokedSession } = useAuth();
  const { t } = useI18n();

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordTouched, setPasswordTouched] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [passwordModified, setPasswordModified] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isStrongPassword =
    passwordForm.newPassword.length >= 8 &&
    /[A-Z]/.test(passwordForm.newPassword) &&
    /[a-z]/.test(passwordForm.newPassword) &&
    /\d/.test(passwordForm.newPassword);

  const getApiErrorMessage = (error: unknown) => {
    const apiError = error as { response?: { data?: { message?: string } }; message?: string };
    return (
      apiError.response?.data?.message ?? apiError.message ?? t("account.password.updateError")
    );
  };

  const handleModalClose = () => {
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setPasswordTouched({ current: false, new: false, confirm: false });
    setPasswordModified({ current: false, new: false, confirm: false });
    setSubmitError(null);
    onClose();
  };

  const handleSave = async () => {
    setSubmitError(null);
    if (!isStrongPassword || passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordTouched({ current: true, new: true, confirm: true });
      return;
    }
    if (user?.hasPassword !== false && passwordForm.currentPassword.length === 0) {
      setPasswordTouched((prev) => ({ ...prev, current: true }));
      return;
    }

    setIsSubmitting(true);
    try {
      await changePassword({
        currentPassword: user?.hasPassword !== false ? passwordForm.currentPassword : undefined,
        newPassword: passwordForm.newPassword,
      });
      await clearRevokedSession();
      handleModalClose();
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleModalClose()}>
      <DialogContent className="bg-canvas text-ink max-w-[500px] rounded-sm border-[#e3dccf] p-6 shadow-2xl md:p-8">
        <DialogHeader className="mb-4 text-left">
          <DialogTitle className="text-ink font-serif text-2xl font-light tracking-tight">
            {user?.hasPassword !== false
              ? t("account.password.editTitle")
              : t("account.password.createTitle")}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          {/* Current Password */}
          {user?.hasPassword !== false && (
            <div>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  id="currentPassword"
                  placeholder={t("account.password.current")}
                  value={passwordForm.currentPassword}
                  onChange={(e) => {
                    setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }));
                    setPasswordModified((prev) => ({ ...prev, current: true }));
                    setPasswordTouched((prev) => ({ ...prev, current: false }));
                  }}
                  onBlur={() => setPasswordTouched((prev) => ({ ...prev, current: true }))}
                  className={`peer text-ink w-full rounded-sm border bg-transparent px-4 py-3.5 pr-12 text-sm placeholder-transparent transition-colors duration-500 ease-out focus:outline-none ${
                    passwordTouched.current &&
                    passwordModified.current &&
                    passwordForm.currentPassword.length === 0
                      ? "border-error focus:border-error"
                      : "focus:border-ink/60 border-[#1c1a18]/20"
                  }`}
                />
                <label
                  htmlFor="currentPassword"
                  className={`bg-canvas absolute -top-2 left-3 cursor-text px-1 text-xs transition-all duration-300 ease-out peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4 peer-placeholder-shown:text-sm peer-focus:-top-2 peer-focus:left-3 peer-focus:text-xs ${
                    passwordTouched.current &&
                    passwordModified.current &&
                    passwordForm.currentPassword.length === 0
                      ? "text-error peer-focus:text-error"
                      : "text-ink/70 peer-focus:text-ink/70"
                  }`}
                >
                  {t("account.password.current")}
                </label>
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  aria-label={t(
                    showCurrentPassword ? "auth.common.hidePassword" : "auth.common.showPassword",
                  )}
                  className="text-ink/45 hover:text-ink absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer p-1.5 transition-colors"
                >
                  {showCurrentPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {passwordTouched.current &&
                passwordModified.current &&
                passwordForm.currentPassword.length === 0 && (
                  <p className="text-error mt-1.5 text-xs transition-opacity duration-300">
                    {t("account.password.currentRequired")}
                  </p>
                )}
            </div>
          )}

          {/* New Password */}
          <div>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                id="newPassword"
                placeholder={t("account.password.new")}
                value={passwordForm.newPassword}
                onChange={(e) => {
                  setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }));
                  setPasswordModified((prev) => ({ ...prev, new: true }));
                  setPasswordTouched((prev) => ({ ...prev, new: false }));
                }}
                onBlur={() => setPasswordTouched((prev) => ({ ...prev, new: true }))}
                className={`peer text-ink w-full rounded-sm border bg-transparent px-4 py-3.5 pr-12 text-sm placeholder-transparent transition-colors duration-500 ease-out focus:outline-none ${
                  passwordTouched.new &&
                  passwordModified.new &&
                  (passwordForm.newPassword.length === 0 || !isStrongPassword)
                    ? "border-error focus:border-error"
                    : "focus:border-ink/60 border-[#1c1a18]/20"
                }`}
              />
              <label
                htmlFor="newPassword"
                className={`bg-canvas absolute -top-2 left-3 cursor-text px-1 text-xs transition-all duration-300 ease-out peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4 peer-placeholder-shown:text-sm peer-focus:-top-2 peer-focus:left-3 peer-focus:text-xs ${
                  passwordTouched.new &&
                  passwordModified.new &&
                  (passwordForm.newPassword.length === 0 || !isStrongPassword)
                    ? "text-error peer-focus:text-error"
                    : "text-ink/70 peer-focus:text-ink/70"
                }`}
              >
                {t("account.password.new")}
              </label>
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                aria-label={t(
                  showNewPassword ? "auth.common.hidePassword" : "auth.common.showPassword",
                )}
                className="text-ink/45 hover:text-ink absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer p-1.5 transition-colors"
              >
                {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {passwordTouched.new &&
              passwordModified.new &&
              passwordForm.newPassword.length === 0 && (
                <p className="text-error mt-1.5 text-xs transition-opacity duration-300">
                  {t("account.password.newRequired")}
                </p>
              )}
            {passwordTouched.new &&
              passwordModified.new &&
              passwordForm.newPassword.length > 0 &&
              !isStrongPassword && (
                <p className="text-error mt-1.5 text-xs transition-opacity duration-300">
                  {t("account.password.strongRequirement")}
                </p>
              )}
          </div>

          {/* Confirm Password */}
          <div>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                placeholder={t("account.password.confirm")}
                value={passwordForm.confirmPassword}
                onChange={(e) => {
                  setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }));
                  setPasswordModified((prev) => ({ ...prev, confirm: true }));
                  setPasswordTouched((prev) => ({ ...prev, confirm: false }));
                }}
                onBlur={() => setPasswordTouched((prev) => ({ ...prev, confirm: true }))}
                className={`peer text-ink w-full rounded-sm border bg-transparent px-4 py-3.5 pr-12 text-sm placeholder-transparent transition-colors duration-500 ease-out focus:outline-none ${
                  passwordTouched.confirm &&
                  passwordModified.confirm &&
                  (passwordForm.confirmPassword.length === 0 ||
                    passwordForm.confirmPassword !== passwordForm.newPassword)
                    ? "border-error focus:border-error"
                    : "focus:border-ink/60 border-[#1c1a18]/20"
                }`}
              />
              <label
                htmlFor="confirmPassword"
                className={`bg-canvas absolute -top-2.5 left-3 cursor-text px-1 text-xs transition-all duration-300 ease-out peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4 peer-placeholder-shown:text-sm peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-xs ${
                  passwordTouched.confirm &&
                  passwordModified.confirm &&
                  (passwordForm.confirmPassword.length === 0 ||
                    passwordForm.confirmPassword !== passwordForm.newPassword)
                    ? "text-error peer-focus:text-error"
                    : "text-ink/70 peer-focus:text-ink/70"
                }`}
              >
                {t("account.password.confirm")}
              </label>
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={t(
                  showConfirmPassword ? "auth.common.hidePassword" : "auth.common.showPassword",
                )}
                className="text-ink/45 hover:text-ink absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer p-1.5 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {passwordTouched.confirm &&
              passwordModified.confirm &&
              passwordForm.confirmPassword.length > 0 &&
              passwordForm.confirmPassword !== passwordForm.newPassword && (
                <p className="text-error mt-1.5 text-xs transition-opacity duration-300">
                  {t("account.password.mismatch")}
                </p>
              )}
            {passwordTouched.confirm &&
              passwordModified.confirm &&
              passwordForm.confirmPassword.length === 0 && (
                <p className="text-error mt-1.5 text-xs transition-opacity duration-300">
                  {t("account.password.confirmRequired")}
                </p>
              )}
          </div>
        </div>

        <PasswordRequirements password={passwordForm.newPassword} className="mt-4 mb-4 pl-1" />

        {submitError && <p className="text-error mb-4 text-sm">{submitError}</p>}

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={
              isSubmitting ||
              (user?.hasPassword !== false
                ? passwordForm.currentPassword.length === 0 ||
                  !isStrongPassword ||
                  passwordForm.newPassword !== passwordForm.confirmPassword
                : !isStrongPassword || passwordForm.newPassword !== passwordForm.confirmPassword)
            }
            className={`cursor-pointer rounded-sm border px-8 py-2.5 text-sm font-medium transition-colors ${
              (
                user?.hasPassword !== false
                  ? passwordForm.currentPassword.length > 0 &&
                    isStrongPassword &&
                    passwordForm.newPassword === passwordForm.confirmPassword
                  : isStrongPassword && passwordForm.newPassword === passwordForm.confirmPassword
              )
                ? "border-[#1c1a18] bg-[#1c1a18] text-white shadow-sm hover:bg-[#1c1a18]/90"
                : "text-ink/40 pointer-events-none cursor-not-allowed border-[#1c1a18]/20 bg-transparent"
            }`}
          >
            {isSubmitting
              ? t("account.profile.saving")
              : user?.hasPassword !== false
                ? t("account.profile.save")
                : t("account.password.create")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
