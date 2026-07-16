"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  User as UserIcon,
  CreditCard,
  Truck,
  Sliders,
  Mail,
  Eye,
  Link2,
  Shield,
  Calendar,
  ChevronDown,
  LockKeyhole,
} from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useAuth } from "@/components/auth/auth-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import { Card } from "@/components/ui/card";
import { useOtpFlow } from "@/components/auth/use-otp-flow";
import { OtpEntry } from "@/components/auth/otp-entry";
import { changeEmail, changePassword } from "@/lib/auth-otp-api";
import { formatDate } from "@/lib/i18n/format";
import type { Locale } from "@/lib/i18n";
import { createEmailSchema, createStrongPasswordSchema } from "@/lib/validations";
import { useReauthenticationRedirect } from "@/components/auth/use-reauthentication-redirect";

const createChangeEmailSchema = (locale: Locale) =>
  z.object({ email: createEmailSchema(locale) });
type ChangeEmailFormValues = z.infer<ReturnType<typeof createChangeEmailSchema>>;

const createChangePasswordSchema = (
  locale: Locale,
  requiredMessage: string,
  mismatchMessage: string,
) =>
  z
    .object({
      currentPassword: z.string().optional(),
      newPassword: createStrongPasswordSchema(locale),
      confirmPassword: z.string({ message: requiredMessage }).min(1, requiredMessage),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: mismatchMessage,
      path: ["confirmPassword"],
    });
type ChangePasswordFormValues = z.infer<ReturnType<typeof createChangePasswordSchema>>;

type SuccessMessage = "email" | "password" | "passwordCreated";

export default function MemberSettings() {
  const { user, isAuthenticated } = useAuth();
  const redirectAfterRevocation = useReauthenticationRedirect();
  const { locale, t } = useI18n();
  const changeEmailSchema = useMemo(() => createChangeEmailSchema(locale), [locale]);
  const changePasswordSchema = useMemo(
    () =>
      createChangePasswordSchema(
        locale,
        t("account.password.confirmRequired"),
        t("account.password.mismatch"),
      ),
    [locale, t],
  );
  const [requestedEmail, setRequestedEmail] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<SuccessMessage | null>(null);
  const [isPasswordEditing, setIsPasswordEditing] = useState(false);
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);
  const [passwordSubmitError, setPasswordSubmitError] = useState<string | null>(null);
  const hasPassword = Boolean(user?.hasPassword);

  const {
    register,
    handleSubmit,
    control,
    resetField,
    formState: { errors },
  } = useForm<ChangeEmailFormValues>({
    resolver: zodResolver(changeEmailSchema as never),
    defaultValues: { email: user?.email || "" },
  });

  const newEmail = useWatch({ control, name: "email" });
  const otpEmail = requestedEmail ?? newEmail;

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    setError: setPasswordFieldError,
    formState: { errors: passwordErrors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema as never),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

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
    email: otpEmail,
    purpose: "CHANGE_EMAIL",
    onVerifySuccess: async (proofToken) => {
      await changeEmail({
        newEmail: otpEmail,
        otpProofToken: proofToken,
      });
      await redirectAfterRevocation();
    },
  });

  const handleRequestChangeEmailOtp = async (data: ChangeEmailFormValues) => {
    setSuccessMessage(null);
    setRequestedEmail(data.email);
    const success = await handleRequestOtp();
    if (!success) {
      setRequestedEmail(null);
    }
  };

  const getApiErrorMessage = (error: unknown) => {
    const apiError = error as {
      response?: { data?: { message?: string } };
      message?: string;
    };

    return apiError.response?.data?.message ?? apiError.message ?? t("account.password.updateError");
  };

  const handleSubmitPassword = async (data: ChangePasswordFormValues) => {
    setSuccessMessage(null);
    setPasswordSubmitError(null);
    if (hasPassword && !data.currentPassword?.trim()) {
      setPasswordFieldError("currentPassword", {
        type: "manual",
        message: t("account.password.currentRequired"),
      });
      return;
    }

    try {
      setIsPasswordSubmitting(true);
      await changePassword({
        currentPassword: hasPassword ? data.currentPassword : undefined,
        newPassword: data.newPassword,
      });
      await redirectAfterRevocation();
    } catch (error) {
      setPasswordSubmitError(getApiErrorMessage(error));
    } finally {
      setIsPasswordSubmitting(false);
    }
  };

  const handleCancelPasswordChange = () => {
    setPasswordSubmitError(null);
    resetPasswordForm();
    setIsPasswordEditing(false);
  };

  // If user is loading or not authenticated, render login prompt
  if (!isAuthenticated || !user) {
    return (
      <div className="mx-auto w-full max-w-[1800px] px-6 py-24 min-h-[70vh] flex flex-col justify-center items-center">
        <Card className="mx-auto flex max-w-md flex-col items-center rounded-sm border-[#1c1a18]/5 bg-[#efe7dc] p-8 py-10 text-center shadow-lg">
          <LockKeyhole className="mb-6 size-12 text-[#b85a3c]" />
          <h2 className="mb-4 font-serif text-2xl font-light text-[#1c1a18]">
            {t("account.signIn.settingsTitle")}
          </h2>
          <p className="mb-8 text-xs leading-relaxed text-[#1c1a18]/65">
            {t("account.signIn.settingsDescription")}
          </p>
          <Link
            href="/sign-in"
            className="inline-flex w-full justify-center rounded-sm bg-[#1c1a18] px-8 py-3.5 text-xs font-bold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#b85a3c]"
          >
            {t("account.signIn.action")}
          </Link>
        </Card>
      </div>
    );
  }

  const subTabs = [
    { id: "profile", label: t("account.tabs.profile"), href: "/profile" },
    { id: "orders", label: t("account.tabs.orders"), href: "/profile?tab=orders" },
    { id: "favourites", label: t("account.tabs.favourites"), href: "/profile?tab=favourites" },
    { id: "settings", label: t("account.tabs.settings"), href: "/profile/settings" },
  ];

  const sidebarLinks = [
    { id: "account", label: t("account.sidebar.account"), icon: UserIcon, active: true },
    { id: "payment", label: t("account.sidebar.payment"), icon: CreditCard, active: false },
    { id: "addresses", label: t("account.sidebar.addresses"), icon: Truck, active: false },
    { id: "preferences", label: t("account.sidebar.preferences"), icon: Sliders, active: false },
    { id: "communication", label: t("account.sidebar.communication"), icon: Mail, active: false },
    { id: "visibility", label: t("account.sidebar.visibility"), icon: Eye, active: false },
    { id: "linked", label: t("account.sidebar.linked"), icon: Link2, active: false },
    { id: "privacy", label: t("account.sidebar.privacy"), icon: Shield, active: false },
  ];

  return (
    <div className="bg-canvas text-ink min-h-screen flex flex-col">
      {/* Sub-Navigation */}
      <div className="w-full border-b border-hairline/40 select-none">
        <div className="max-w-[1280px] mx-auto flex justify-center gap-8 py-4">
          {subTabs.map((tab) => {
            const isActive = tab.id === "settings";
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`text-sm font-medium tracking-[0.05em] transition-colors pb-1 ${
                  isActive
                    ? "text-primary border-b-2 border-primary -mb-[18px]"
                    : "text-[#55423d]/60 hover:text-ink"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-grow max-w-[1280px] w-full mx-auto px-6 md:px-16 py-16 flex flex-col md:flex-row gap-12">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 flex-shrink-0 text-left">
          <h1 className="font-serif text-3xl font-light text-ink mb-8">{t("account.settings.title")}</h1>
          <nav className="flex flex-col gap-2">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.id}
                  className={`flex items-center gap-4 py-3 px-4 rounded-sm text-sm font-medium transition-colors text-left cursor-pointer ${
                    link.active
                      ? "bg-surface-card text-primary"
                      : "text-[#55423d]/70 hover:text-ink hover:bg-surface-card/40"
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {link.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Right Content Area */}
        <section className="flex-grow max-w-3xl text-left">
          <h2 className="font-serif text-2xl md:text-3xl text-ink font-light mb-10">{t("account.sidebar.account")}</h2>
          <div className="flex flex-col gap-8">
            {/* Email Field Form */}
            <form onSubmit={handleSubmit(handleRequestChangeEmailOtp)} className="flex flex-col gap-2">
              <div className="relative">
                <label className="absolute -top-2.5 left-3 bg-canvas px-1 text-[11px] font-medium tracking-widest text-[#55423d]/80 uppercase">
                  {t("account.profile.email")}
                </label>
                <input
                  className="w-full bg-transparent border border-hairline rounded-sm px-4 py-4 text-sm text-ink focus:outline-hidden focus:border-primary transition-all disabled:opacity-50"
                  type="email"
                  disabled={showOtpStep || isOtpSubmitting}
                  {...register("email")}
                />
              </div>

              {errors.email && !showOtpStep && (
                <p className="text-xs text-red-600 font-medium">{errors.email.message}</p>
              )}

              {otpError && !showOtpStep && (
                <p className="text-xs text-red-600 font-medium">{otpError}</p>
              )}

              {successMessage && (
                <p className="text-xs text-green-600 font-medium">
                  {successMessage === "email"
                    ? t("account.settings.emailUpdated")
                    : successMessage === "password"
                      ? t("account.password.updateSuccess")
                      : t("account.password.createSuccess")}
                </p>
              )}

              {newEmail !== user.email && !showOtpStep && (
                <div className="mt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isOtpSubmitting}
                    className="px-6 py-2.5 bg-[#964025] hover:bg-[#87391f] text-white text-xs font-semibold rounded-sm tracking-wider uppercase disabled:opacity-50 cursor-pointer border-0"
                  >
                    {t("account.settings.verifyEmail")}
                  </button>
                </div>
              )}

              {showOtpStep && (
                <OtpEntry
                  inline
                  email={otpEmail}
                  otpCode={otpCode}
                  setOtpCode={setOtpCode}
                  cooldown={cooldown}
                  isSubmitting={isOtpSubmitting}
                  error={otpError}
                  onVerify={handleVerifyOtp}
                  onResend={handleRequestOtp}
                  onCancel={() => {
                    resetFlow();
                    resetField("email", { defaultValue: user.email });
                    setRequestedEmail(null);
                  }}
                  cancelLabel={t("account.settings.cancel")}
                  actionLabel={t("account.settings.confirmCode")}
                />
              )}
            </form>

            <div className="flex flex-col gap-8">
              {/* Password Section */}
              <form
                className="flex flex-col gap-4 border-b border-hairline/60 pb-6"
                onSubmit={handlePasswordSubmit(handleSubmitPassword)}
              >
                <div className="flex justify-between items-start gap-6">
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-ink">
                      {hasPassword ? t("account.profile.password") : t("account.password.createTitle")}
                    </span>
                    <span className="text-sm text-[#55423d]/60">
                      {hasPassword
                        ? t("account.password.changeDescription")
                        : t("account.password.createDescription")}
                    </span>
                  </div>
                  {!isPasswordEditing && (
                    <button
                      className="text-sm font-medium text-primary underline hover:text-[#964025] transition-colors disabled:opacity-50"
                      type="button"
                      disabled={showOtpStep}
                      onClick={() => {
                        setSuccessMessage(null);
                        setIsPasswordEditing(true);
                      }}
                    >
                      {hasPassword ? t("account.profile.edit") : t("account.password.set")}
                    </button>
                  )}
                </div>

                {isPasswordEditing && (
                  <div className="grid gap-4">
                    {hasPassword && (
                      <div className="relative">
                        <label className="absolute -top-2.5 left-3 bg-canvas px-1 text-[11px] font-medium tracking-widest text-[#55423d]/80 uppercase">
                          {t("account.password.current")}
                        </label>
                        <input
                          className="w-full bg-transparent border border-hairline rounded-sm px-4 py-4 text-sm text-ink focus:outline-hidden focus:border-primary transition-all disabled:opacity-50"
                          type="password"
                          autoComplete="current-password"
                          disabled={isPasswordSubmitting}
                          {...registerPassword("currentPassword")}
                        />
                        {passwordErrors.currentPassword && (
                          <p className="mt-2 text-xs text-red-600 font-medium">
                            {passwordErrors.currentPassword.message}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="relative">
                      <label className="absolute -top-2.5 left-3 bg-canvas px-1 text-[11px] font-medium tracking-widest text-[#55423d]/80 uppercase">
                        {t("account.password.new")}
                      </label>
                      <input
                        className="w-full bg-transparent border border-hairline rounded-sm px-4 py-4 text-sm text-ink focus:outline-hidden focus:border-primary transition-all disabled:opacity-50"
                        type="password"
                        autoComplete="new-password"
                        disabled={isPasswordSubmitting}
                        {...registerPassword("newPassword")}
                      />
                      {passwordErrors.newPassword && (
                        <p className="mt-2 text-xs text-red-600 font-medium">
                          {passwordErrors.newPassword.message}
                        </p>
                      )}
                    </div>

                    <div className="relative">
                      <label className="absolute -top-2.5 left-3 bg-canvas px-1 text-[11px] font-medium tracking-widest text-[#55423d]/80 uppercase">
                        {t("account.password.confirm")}
                      </label>
                      <input
                        className="w-full bg-transparent border border-hairline rounded-sm px-4 py-4 text-sm text-ink focus:outline-hidden focus:border-primary transition-all disabled:opacity-50"
                        type="password"
                        autoComplete="new-password"
                        disabled={isPasswordSubmitting}
                        {...registerPassword("confirmPassword")}
                      />
                      {passwordErrors.confirmPassword && (
                        <p className="mt-2 text-xs text-red-600 font-medium">
                          {passwordErrors.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    {passwordSubmitError && (
                      <p className="text-xs text-red-600 font-medium">{passwordSubmitError}</p>
                    )}

                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        disabled={isPasswordSubmitting}
                        onClick={handleCancelPasswordChange}
                        className="px-5 py-2.5 border border-hairline/80 rounded-sm text-xs font-semibold uppercase tracking-wider text-ink hover:border-primary transition-colors disabled:opacity-50"
                      >
                        {t("account.settings.cancel")}
                      </button>
                      <button
                        type="submit"
                        disabled={isPasswordSubmitting}
                        className="px-6 py-2.5 bg-[#964025] hover:bg-[#87391f] text-white text-xs font-semibold rounded-sm tracking-wider uppercase disabled:opacity-50 cursor-pointer border-0"
                      >
                        {hasPassword ? t("account.password.update") : t("account.password.create")}
                      </button>
                    </div>
                  </div>
                )}
              </form>

              {/* Date of Birth Field */}
              <div className="relative">
                <label className="absolute -top-2.5 left-3 bg-canvas px-1 text-[11px] font-medium tracking-widest text-[#55423d]/40 uppercase select-none">
                  {t("account.profile.birthDate")}
                </label>
                <div className="relative flex items-center">
                  <input
                    className="w-full bg-transparent border border-hairline/60 rounded-sm px-4 py-4 text-sm text-[#55423d]/60 opacity-60 focus:outline-hidden cursor-not-allowed"
                    disabled
                    type="text"
                    defaultValue={
                      user.birthDate
                        ? formatDate(user.birthDate, locale, { dateStyle: "short" })
                        : formatDate("2005-09-07", locale, { dateStyle: "short" })
                    }
                  />
                  <Calendar className="absolute right-4 text-[#55423d]/45 w-5 h-5 pointer-events-none" />
                </div>
              </div>

              {/* Location Dropdown */}
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-ink mb-4">{t("account.settings.location")}</h3>
                <div className="relative">
                  <label className="absolute -top-2.5 left-3 bg-canvas px-1 text-[11px] font-medium tracking-widest text-[#55423d]/80 uppercase">
                    {t("account.settings.country")}
                  </label>
                  <select className="w-full bg-transparent border border-hairline rounded-sm px-4 py-4 text-sm text-ink focus:outline-hidden focus:border-primary transition-all appearance-none cursor-pointer">
                    <option value="vn">{t("account.settings.country.vietnam")}</option>
                    <option value="us">{t("account.settings.country.us")}</option>
                    <option value="uk">{t("account.settings.country.uk")}</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#55423d] w-5 h-5" />
                </div>
              </div>

              {/* Delete Account */}
              <div className="mt-8 border-t border-b border-hairline/60 py-6 flex justify-between items-center">
                <span className="text-sm font-medium text-ink">{t("account.profile.deleteAccount")}</span>
                <button
                  className="px-6 py-2 border border-hairline/80 rounded-full text-xs font-semibold text-ink hover:border-red-600 hover:text-red-600 transition-colors"
                  type="button"
                >
                  {t("account.profile.delete")}
                </button>
              </div>

              {/* Save Action */}
              <div className="flex justify-end mt-8">
                <button
                  className="bg-surface-card text-[#55423d]/60 px-8 py-3 rounded-sm text-xs font-semibold cursor-not-allowed"
                  disabled
                  type="button"
                >
                  {t("account.profile.save")}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
