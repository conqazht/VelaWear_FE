"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { AnimatedAuthShell } from "@/components/auth/animated-auth-shell";
import { FloatingInput } from "@/components/auth/floating-input";
import { resetPassword } from "@/lib/auth-otp-api";
import { useOtpFlow } from "@/components/auth/use-otp-flow";
import { OtpEntry } from "@/components/auth/otp-entry";
import type {
  AuthSceneFocus,
  AuthSceneStatus,
} from "@/components/auth/auth-motion-scene";
import { emailSchema, strongPasswordSchema } from "@/lib/validations";

const requestSchema = z.object({ email: emailSchema });
const resetSchema = z.object({ newPassword: strongPasswordSchema });

type RequestFormValues = z.infer<typeof requestSchema>;
type ResetFormValues = z.infer<typeof resetSchema>;

export function ForgotPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<"REQUEST" | "VERIFY" | "SUCCESS">("REQUEST");

  const [sceneFocus, setSceneFocus] = useState<AuthSceneFocus>("none");
  const [sceneStatus, setSceneStatus] = useState<AuthSceneStatus>("idle");

  const requestForm = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema as any),
    defaultValues: { email: "" },
    shouldFocusError: false,
  });

  const resetForm = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema as any),
    defaultValues: { newPassword: "" },
    shouldFocusError: false,
  });

  const emailValue = requestForm.watch("email");

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
    onVerifySuccess: async () => {
      try {
        await resetPassword({ email: emailValue, newPassword: resetForm.getValues("newPassword") });
        setSceneStatus("success");
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setStep("SUCCESS");
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
    } catch (err) {
      setSceneStatus("error");
      setTimeout(() => setSceneStatus("idle"), 850);
    }
  };

  const handleCancel = () => {
    resetFlow();
    setStep("REQUEST");
  };

  let title = "Reset Password";
  let description = "Enter your email to request a verification code.";
  if (step === "VERIFY") {
    title = "Verify Email";
    description = `We sent a 6-digit verification code to ${emailValue}.`;
  } else if (step === "SUCCESS") {
    title = "Password Reset";
    description = "Your password has been successfully reset.";
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
            <Link href="/sign-in" className="text-sm text-[#55423d] hover:text-[#964025] underline decoration-[#964025]/30 underline-offset-4">
              Back to Sign In
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
            You can now sign in with your new password.
          </p>
          <Link
            href="/sign-in"
            className="flex h-12 w-full items-center justify-center rounded-[12px] bg-[#964025] text-sm font-medium uppercase tracking-wider text-white transition-colors hover:bg-[#87391f] cursor-pointer"
          >
            Go to Sign In
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
            cancelLabel="Change email"
            actionLabel="Reset Password"
            plain={true}
          >
            <div>
              <FloatingInput
                id="newPassword"
                label="New Password*"
                type={showPassword ? "text" : "password"}
                error={!!resetForm.formState.errors.newPassword}
                {...passwordRegister}
                inputRef={passwordRegister.ref}
                onFocus={(e) => {
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
                    aria-label={showPassword ? "Hide password" : "Show password"}
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
              {resetForm.formState.errors.newPassword && (
                <div className="mt-2 flex flex-col gap-1">
                  <span className="flex items-center gap-2 text-[11px] font-medium text-destructive uppercase tracking-wider">
                    <X className="size-3 text-destructive" strokeWidth={2.5} /> {resetForm.formState.errors.newPassword.message}
                  </span>
                </div>
              )}
            </div>
          </OtpEntry>
        </form>
      )}

      {step === "REQUEST" && (
        <form onSubmit={requestForm.handleSubmit(onRequestSubmit, onInvalid)} className="flex flex-col gap-6">
          {otpError && (
            <div className="rounded-sm border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-700">
              {otpError}
            </div>
          )}

          <div>
            <FloatingInput
              id="email"
              label="Email*"
              type="email"
              error={!!requestForm.formState.errors.email}
              {...emailRegister}
              onFocus={(e) => {
                setSceneFocus("email");
              }}
              onBlur={(e) => {
                emailRegister.onBlur(e);
                setSceneFocus("none");
              }}
            />
            {requestForm.formState.errors.email && (
              <p className="mt-1 text-xs text-destructive font-semibold uppercase tracking-wider">{requestForm.formState.errors.email.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isOtpSubmitting}
            className="flex h-12 w-full items-center justify-center rounded-[12px] bg-[#964025] text-sm font-medium uppercase tracking-wider text-white transition-colors hover:bg-[#87391f] disabled:opacity-50 cursor-pointer"
          >
            {isOtpSubmitting ? "Requesting..." : "Send Verification Code"}
          </button>
        </form>
      )}
    </AnimatedAuthShell>
  );
}
