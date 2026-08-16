"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Check, Eye, EyeOff } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { AnimatedAuthShell } from "@/components/auth/animated-auth-shell";
import { FloatingInput } from "@/components/auth/floating-input";
import { PasswordRequirements } from "@/components/auth/password-requirements";
import { resetPassword } from "@/lib/auth-otp-api";
import { useOtpFlow } from "@/components/auth/use-otp-flow";
import { OtpEntry } from "@/components/auth/otp-entry";
import { useI18n } from "@/components/providers/i18n-provider";
import { useReauthenticationRedirect } from "@/components/auth/use-reauthentication-redirect";
import type {
  AuthSceneFocus,
  AuthSceneStatus,
} from "@/components/auth/auth-motion-scene";
import {
  createForgotPasswordRequestSchema,
  createStrongPasswordSchema,
} from "@/lib/validations";

type RequestFormValues = { email: string };
type ResetFormValues = { newPassword: string };

export function ForgotPasswordPage() {
  const { locale, t } = useI18n();
  const redirectAfterRevocation = useReauthenticationRedirect();
  const requestSchema = useMemo(
    () => createForgotPasswordRequestSchema(locale),
    [locale],
  );
  const resetSchema = useMemo(
    () => z.object({ newPassword: createStrongPasswordSchema(locale) }),
    [locale],
  );
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<"REQUEST" | "VERIFY" | "SUCCESS">("REQUEST");

  const [sceneFocus, setSceneFocus] = useState<AuthSceneFocus>("none");
  const [sceneStatus, setSceneStatus] = useState<AuthSceneStatus>("idle");

  const requestForm = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema as never),
    defaultValues: { email: "" },
    shouldFocusError: false,
  });

  const resetForm = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema as never),
    defaultValues: { newPassword: "" },
    shouldFocusError: false,
  });

  const emailValue = useWatch({
    control: requestForm.control,
    name: "email",
  });

  const newPasswordValue = useWatch({
    control: resetForm.control,
    name: "newPassword",
  }) ?? "";

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
    email: emailValue,
    purpose: "FORGOT_PASSWORD",
    onVerifySuccess: async (proofToken) => {
      try {
        await resetPassword({
          email: emailValue,
          newPassword: resetForm.getValues("newPassword"),
          otpProofToken: proofToken,
        });
        setSceneStatus("success");
        setStep("SUCCESS");
        await redirectAfterRevocation();
      } catch (err: unknown) {
        setSceneStatus("error");
        setTimeout(() => setSceneStatus("idle"), 850);
        throw err;
      }
    },
  });

  const onRequestSubmit = async () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    const success = await handleRequestOtp();
    if (success) {
      setStep("VERIFY");
    } else {
      setSceneStatus("error");
      setTimeout(() => setSceneStatus("idle"), 850);
    }
  };

  const onResetSubmit = async () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    try {
      await handleVerifyOtp();
    } catch {
      setSceneStatus("error");
      setTimeout(() => setSceneStatus("idle"), 850);
    }
  };

  const handleCancel = () => {
    resetFlow();
    setStep("REQUEST");
  };

  let title = t("auth.forgot.requestTitle");
  let description = t("auth.forgot.requestDescription");
  if (step === "VERIFY") {
    title = t("auth.forgot.verifyTitle");
    description = t("auth.forgot.verifyDescription", { email: emailValue });
  } else if (step === "SUCCESS") {
    title = t("auth.forgot.successTitle");
    description = t("auth.forgot.successDescription");
  }

  const onInvalid = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setSceneStatus("error");
    setTimeout(() => setSceneStatus("idle"), 850);
  };

  const emailRegister = requestForm.register("email");
  const passwordRegister = resetForm.register("newPassword");

  return (
    <AnimatedAuthShell
      mode="forgot-password"
      focus={sceneFocus}
      passwordVisible={showPassword}
      status={sceneStatus}
      title={title}
      description={description}
      footer={
        step !== "SUCCESS" && (
          <p className="mt-8 text-center text-sm leading-[1.55] text-[#55423d]">
            <Link href="/sign-in" className="text-sm text-[#55423d] hover:text-[#b5573a] underline decoration-[#b5573a]/30 underline-offset-4">
              {t("auth.common.backToSignIn")}
            </Link>
          </p>
        )
      }
    >
      {step === "SUCCESS" && (
        <div className="space-y-6 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
            <Check className="h-8 w-8" />
          </div>
          <p className="text-sm leading-[1.55] text-[#55423d] mb-8">
            {t("auth.forgot.successBody")}
          </p>
          <Link
            href="/sign-in"
            className="flex h-12 w-full items-center justify-center rounded-[12px] bg-[#b5573a] text-sm font-medium uppercase tracking-wider text-white transition-colors hover:bg-[#8f4329] cursor-pointer"
          >
            {t("auth.forgot.goToSignIn")}
          </Link>
        </div>
      )}

      {step === "VERIFY" && showOtpStep && (
        <form onSubmit={resetForm.handleSubmit(onResetSubmit, onInvalid)}>
          <OtpEntry
            email={emailValue}
            otpCode={otpCode}
            setOtpCode={setOtpCode}
            cooldown={cooldown}
            isSubmitting={isOtpSubmitting}
            error={otpError}
            onVerify={resetForm.handleSubmit(onResetSubmit, onInvalid)}
            onResend={handleRequestOtp}
            onCancel={handleCancel}
            cancelLabel={t("auth.otp.changeEmail")}
            actionLabel={t("auth.forgot.resetAction")}
            plain={true}
          >
            <div>
              <FloatingInput
                id="newPassword"
                label={t("auth.common.newPassword")}
                type={showPassword ? "text" : "password"}
                error={!!resetForm.formState.errors.newPassword}
                {...passwordRegister}
                inputRef={passwordRegister.ref}
                onFocus={() => {
                  setSceneFocus("password");
                }}
                onBlur={(e) => {
                  passwordRegister.onBlur(e);
                  setSceneFocus("none");
                }}
                trailing={
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setShowPassword(!showPassword);
                      setSceneFocus("password");
                      setTimeout(() => resetForm.setFocus("newPassword"), 0);
                    }}
                    aria-label={t(showPassword ? "auth.common.hidePassword" : "auth.common.showPassword")}
                    className="cursor-pointer p-1 transition-opacity hover:opacity-85"
                  >
                    {showPassword ? (
                      <EyeOff className="size-[22px] text-ink" />
                    ) : (
                      <Eye className="size-[22px] text-ink" />
                    )}
                  </button>
                }
              />
              {(newPasswordValue.length > 0 || resetForm.formState.isSubmitted || sceneFocus === "password") && (
                <PasswordRequirements
                  password={newPasswordValue}
                  showTitle={false}
                  className="mt-2.5 px-1"
                />
              )}
            </div>
          </OtpEntry>
        </form>
      )}

      {step === "REQUEST" && (
        <form onSubmit={requestForm.handleSubmit(onRequestSubmit, onInvalid)} className="flex flex-col gap-6">
          {otpError && (
            <div className="rounded-[12px] border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-700">
              {otpError}
            </div>
          )}

          <div>
            <FloatingInput
              id="email"
              label={t("auth.common.email")}
              type="email"
              error={!!requestForm.formState.errors.email}
              {...emailRegister}
              onFocus={() => {
                setSceneFocus("email");
              }}
              onBlur={(e) => {
                emailRegister.onBlur(e);
                setSceneFocus("none");
              }}
            />
            {requestForm.formState.errors.email && (
              <p className="mt-1 text-xs text-destructive font-semibold uppercase tracking-wider">
                {requestForm.formState.errors.email.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isOtpSubmitting}
            className="flex h-12 w-full items-center justify-center rounded-[12px] bg-[#b5573a] text-sm font-medium uppercase tracking-wider text-white transition-colors hover:bg-[#8f4329] disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {isOtpSubmitting ? t("auth.forgot.requesting") : t("auth.forgot.sendCode")}
          </button>
        </form>
      )}
    </AnimatedAuthShell>
  );
}
