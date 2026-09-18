"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import { changePassword } from "@/lib/auth-otp-api";
import { PasswordRequirements } from "@/components/auth/password-requirements";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface PasswordFieldProps {
  id: string;
  label: string;
  autoComplete: string;
  value: string;
  show: boolean;
  onToggleShow: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  hasError: boolean;
  errorMessage?: string | null;
  t: ReturnType<typeof useI18n>["t"];
}

function PasswordField({
  id,
  label,
  autoComplete,
  value,
  show,
  onToggleShow,
  onChange,
  onBlur,
  hasError,
  errorMessage,
  t,
}: PasswordFieldProps) {
  return (
    <div>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          id={id}
          autoComplete={autoComplete}
          placeholder={label}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={`peer text-ink w-full rounded-sm border bg-transparent px-4 py-3.5 pr-12 text-sm placeholder-transparent transition-colors duration-500 ease-out focus:outline-none ${
            hasError ? "border-error focus:border-error" : "focus:border-ink/60 border-[#1c1a18]/20"
          }`}
        />
        <label
          htmlFor={id}
          className={`bg-canvas absolute -top-2 left-3 cursor-text px-1 text-xs transition-all duration-300 ease-out peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4 peer-placeholder-shown:text-sm peer-focus:-top-2 peer-focus:left-3 peer-focus:text-xs ${
            hasError ? "text-error peer-focus:text-error" : "text-ink/70 peer-focus:text-ink/70"
          }`}
        >
          {label}
        </label>
        <button
          type="button"
          onClick={onToggleShow}
          aria-label={t(show ? "auth.common.hidePassword" : "auth.common.showPassword")}
          className="text-ink/45 hover:text-ink absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer p-1.5 transition-colors"
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      {hasError && errorMessage && (
        <p className="text-error mt-1.5 text-xs transition-opacity duration-300">{errorMessage}</p>
      )}
    </div>
  );
}

function PasswordModalSubmitButton({
  isSubmitting,
  hasPassword,
  canSubmit,
  onSave,
  t,
}: {
  isSubmitting: boolean;
  hasPassword: boolean;
  canSubmit: boolean;
  onSave: () => void;
  t: ReturnType<typeof useI18n>["t"];
}) {
  return (
    <div className="flex justify-end">
      <button
        type="button"
        onClick={onSave}
        disabled={isSubmitting || !canSubmit}
        className={cn(
          "cursor-pointer rounded-sm border px-8 py-2.5 text-sm font-medium transition-colors",
          canSubmit
            ? "border-[#1c1a18] bg-[#1c1a18] text-white shadow-sm hover:bg-[#1c1a18]/90"
            : "text-ink/40 pointer-events-none cursor-not-allowed border-[#1c1a18]/20 bg-transparent",
        )}
      >
        {isSubmitting
          ? t("account.profile.saving")
          : hasPassword
            ? t("account.profile.save")
            : t("account.password.create")}
      </button>
    </div>
  );
}

function getNewPasswordError(
  touched: boolean,
  modified: boolean,
  value: string,
  isStrong: boolean,
  t: ReturnType<typeof useI18n>["t"],
): string | null {
  if (!touched || !modified) return null;
  if (value.length === 0) return t("account.password.newRequired");
  if (!isStrong) return t("account.password.strongRequirement");
  return null;
}

function getConfirmPasswordError(
  touched: boolean,
  modified: boolean,
  value: string,
  newPass: string,
  t: ReturnType<typeof useI18n>["t"],
): string | null {
  if (!touched || !modified) return null;
  if (value.length === 0) return t("account.password.confirmRequired");
  if (value !== newPass) return t("account.password.mismatch");
  return null;
}

interface PasswordFormFieldsProps {
  hasPassword: boolean;
  passwordForm: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
  passwordTouched: {
    current: boolean;
    new: boolean;
    confirm: boolean;
  };
  passwordModified: {
    current: boolean;
    new: boolean;
    confirm: boolean;
  };
  isStrongPassword: boolean;
  onUpdateField: (
    field: "currentPassword" | "newPassword" | "confirmPassword",
    val: string,
  ) => void;
  onBlurField: (field: "current" | "new" | "confirm") => void;
  t: ReturnType<typeof useI18n>["t"];
}

function PasswordFormFields({
  hasPassword,
  passwordForm,
  passwordTouched,
  passwordModified,
  isStrongPassword,
  onUpdateField,
  onBlurField,
  t,
}: PasswordFormFieldsProps) {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const currentHasError =
    passwordTouched.current &&
    passwordModified.current &&
    passwordForm.currentPassword.length === 0;

  const newPasswordError = getNewPasswordError(
    passwordTouched.new,
    passwordModified.new,
    passwordForm.newPassword,
    isStrongPassword,
    t,
  );

  const confirmPasswordError = getConfirmPasswordError(
    passwordTouched.confirm,
    passwordModified.confirm,
    passwordForm.confirmPassword,
    passwordForm.newPassword,
    t,
  );

  return (
    <div className="flex flex-col gap-6">
      {hasPassword && (
        <PasswordField
          id="currentPassword"
          label={t("account.password.current")}
          autoComplete="current-password"
          value={passwordForm.currentPassword}
          show={showCurrent}
          onToggleShow={() => setShowCurrent((prev) => !prev)}
          onChange={(e) => onUpdateField("currentPassword", e.target.value)}
          onBlur={() => onBlurField("current")}
          hasError={currentHasError}
          errorMessage={t("account.password.currentRequired")}
          t={t}
        />
      )}

      <PasswordField
        id="newPassword"
        label={t("account.password.new")}
        autoComplete="new-password"
        value={passwordForm.newPassword}
        show={showNew}
        onToggleShow={() => setShowNew((prev) => !prev)}
        onChange={(e) => onUpdateField("newPassword", e.target.value)}
        onBlur={() => onBlurField("new")}
        hasError={Boolean(newPasswordError)}
        errorMessage={newPasswordError}
        t={t}
      />

      <PasswordField
        id="confirmPassword"
        label={t("account.password.confirm")}
        autoComplete="new-password"
        value={passwordForm.confirmPassword}
        show={showConfirm}
        onToggleShow={() => setShowConfirm((prev) => !prev)}
        onChange={(e) => onUpdateField("confirmPassword", e.target.value)}
        onBlur={() => onBlurField("confirm")}
        hasError={Boolean(confirmPasswordError)}
        errorMessage={confirmPasswordError}
        t={t}
      />
    </div>
  );
}

export function EditPasswordModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user, clearRevokedSession } = useAuth();
  const { t } = useI18n();

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

  const hasPassword = user?.hasPassword !== false;
  const isStrongPassword =
    passwordForm.newPassword.length >= 8 &&
    /[A-Z]/.test(passwordForm.newPassword) &&
    /[a-z]/.test(passwordForm.newPassword) &&
    /\d/.test(passwordForm.newPassword);
  const passwordsMatch = passwordForm.newPassword === passwordForm.confirmPassword;
  const currentPasswordValid = !hasPassword || passwordForm.currentPassword.length > 0;
  const canSubmit = isStrongPassword && passwordsMatch && currentPasswordValid;

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

  const handleUpdateField = (
    field: "currentPassword" | "newPassword" | "confirmPassword",
    value: string,
  ) => {
    const key =
      field === "currentPassword" ? "current" : field === "newPassword" ? "new" : "confirm";
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
    setPasswordModified((prev) => ({ ...prev, [key]: true }));
    setPasswordTouched((prev) => ({ ...prev, [key]: false }));
  };

  const handleBlurField = (field: "current" | "new" | "confirm") => {
    setPasswordTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSave = async () => {
    setSubmitError(null);
    if (!isStrongPassword || !passwordsMatch) {
      setPasswordTouched({ current: true, new: true, confirm: true });
      return;
    }
    if (hasPassword && passwordForm.currentPassword.length === 0) {
      setPasswordTouched((prev) => ({ ...prev, current: true }));
      return;
    }

    setIsSubmitting(true);
    try {
      await changePassword({
        currentPassword: hasPassword ? passwordForm.currentPassword : undefined,
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
            {hasPassword ? t("account.password.editTitle") : t("account.password.createTitle")}
          </DialogTitle>
        </DialogHeader>

        <PasswordFormFields
          hasPassword={hasPassword}
          passwordForm={passwordForm}
          passwordTouched={passwordTouched}
          passwordModified={passwordModified}
          isStrongPassword={isStrongPassword}
          onUpdateField={handleUpdateField}
          onBlurField={handleBlurField}
          t={t}
        />

        <PasswordRequirements password={passwordForm.newPassword} className="mt-4 mb-4 pl-1" />

        {submitError && <p className="text-error mb-4 text-sm">{submitError}</p>}

        <PasswordModalSubmitButton
          isSubmitting={isSubmitting}
          hasPassword={hasPassword}
          canSubmit={canSubmit}
          onSave={handleSave}
          t={t}
        />
      </DialogContent>
    </Dialog>
  );
}
