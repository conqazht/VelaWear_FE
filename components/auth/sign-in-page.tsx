"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { AnimatedAuthShell } from "@/components/auth/animated-auth-shell";
import { AuthLoader } from "@/components/auth/auth-loader";
import { FloatingInput } from "@/components/auth/floating-input";
import { useAuth } from "@/components/auth/auth-provider";
import { GoogleOAuthButton } from "@/components/auth/google-oauth-button";
import { useI18n } from "@/components/providers/i18n-provider";
import type { AuthSceneFocus, AuthSceneStatus } from "@/components/auth/auth-motion-scene";
import { getSafeInternalRedirect } from "@/lib/auth/post-auth-redirect";
import { getPostSignInPath, getRoleSessionLabel } from "@/lib/auth/roles";
import { getAuthRoleMessageKey } from "@/lib/i18n/messages/auth-errors";
import { createSignInSchema } from "@/lib/validations";

type SignInFormValues = { email: string; password: string };

export function SignInPage() {
  const { locale, t } = useI18n();
  const signInSchema = useMemo(() => createSignInSchema(locale), [locale]);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAuth();
  const redirectTo = getSafeInternalRedirect(searchParams.get("redirect"));

  const [apiError, setApiError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [sessionRoleLabel, setSessionRoleLabel] = useState<string | null>(null);
  const [sceneFocus, setSceneFocus] = useState<AuthSceneFocus>("none");
  const [sceneStatus, setSceneStatus] = useState<AuthSceneStatus>("idle");

  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema as never),
    defaultValues: { email: "", password: "" },
    shouldFocusError: false,
  });

  const onSubmit = async (data: SignInFormValues) => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setApiError(null);
    setSessionRoleLabel(null);
    setSceneStatus("idle");

    try {
      const profile = await signIn(data.email, data.password);
      setSessionRoleLabel(getRoleSessionLabel(profile));
      setIsRedirecting(true);
      router.replace(redirectTo ?? getPostSignInPath(profile));
    } catch {
      setIsRedirecting(false);
      setSessionRoleLabel(null);
      setApiError(t("auth.signIn.invalidCredentials"));
      setSceneStatus("error");
      setTimeout(() => setSceneStatus("idle"), 850);
    }
  };

  const onInvalid = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setSceneStatus("error");
    setTimeout(() => setSceneStatus("idle"), 850);
  };

  const emailRegister = register("email");
  const passwordRegister = register("password");

  if (isRedirecting) {
    return (
      <AuthLoader
        message={
          sessionRoleLabel
            ? t("auth.common.checkingSession", {
                role: t(getAuthRoleMessageKey(sessionRoleLabel)),
              })
            : t("auth.loader.authenticating")
        }
        mode="authenticating"
      />
    );
  }

  return (
    <AnimatedAuthShell
      mode="sign-in"
      focus={sceneFocus}
      passwordVisible={showPassword}
      status={sceneStatus}
      title={t("auth.signIn.title")}
      description={t("auth.signIn.description")}
      footer={
        <p className="mt-8 text-center text-sm leading-[1.55] text-[#55423d]">
          {t("auth.signIn.newMember")}{" "}
          <Link
            href="/register"
            className="font-medium text-[#b5573a] underline decoration-[#b5573a]/30 underline-offset-2 transition-colors hover:text-[#8f4329]"
          >
            {t("auth.signIn.joinCommunity")}
          </Link>
        </p>
      }
    >
      <form noValidate onSubmit={handleSubmit(onSubmit, onInvalid)} className="flex flex-col gap-6">
        {apiError && (
          <div className="border-error/20 bg-error/10 text-error rounded-[12px] border p-3 text-sm">
            {apiError}
          </div>
        )}

        <div>
          <FloatingInput
            id="email"
            label={t("auth.common.email")}
            autoComplete="email"
            type="email"
            error={!!errors.email}
            {...emailRegister}
            onFocus={() => {
              setSceneFocus("email");
            }}
            onBlur={(e) => {
              emailRegister.onBlur(e);
              setSceneFocus("none");
            }}
          />
          {errors.email && (
            <p className="text-destructive mt-1 text-xs font-medium">{errors.email.message}</p>
          )}
        </div>

        <div>
          <FloatingInput
            id="password"
            label={t("auth.common.password")}
            autoComplete="current-password"
            type={showPassword ? "text" : "password"}
            error={!!errors.password}
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
                  setTimeout(() => setFocus("password"), 0);
                }}
                aria-label={t(
                  showPassword ? "auth.common.hidePassword" : "auth.common.showPassword",
                )}
                className="cursor-pointer p-1 transition-opacity hover:opacity-85"
              >
                {showPassword ? (
                  <EyeOff className="text-ink size-[22px]" />
                ) : (
                  <Eye className="text-ink size-[22px]" />
                )}
              </button>
            }
          />
          {errors.password && (
            <p className="text-destructive mt-1 text-xs font-medium">{errors.password.message}</p>
          )}
          <div className="mt-2 flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm leading-[1.55] text-[#1c1a18] transition-colors hover:text-[#b5573a]"
            >
              {t("auth.signIn.forgotPassword")}
            </Link>
          </div>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex h-12 w-full cursor-pointer items-center justify-center rounded-[12px] bg-[#b5573a] text-sm font-medium tracking-wider text-white uppercase shadow-sm transition-colors hover:bg-[#8f4329] disabled:opacity-50"
        >
          {isSubmitting
            ? sessionRoleLabel
              ? t("auth.common.checkingSession", {
                  role: t(getAuthRoleMessageKey(sessionRoleLabel)),
                })
              : t("auth.signIn.submitting")
            : t("auth.common.signIn")}
        </button>

        <div className="relative mt-2 flex items-center">
          <div className="flex-grow border-t border-[#1c1a18]/10"></div>
          <span className="mx-4 flex-shrink-0 text-xs tracking-wider text-[#1c1a18]/50 uppercase">
            {t("auth.common.or")}
          </span>
          <div className="flex-grow border-t border-[#1c1a18]/10"></div>
        </div>

        <GoogleOAuthButton redirectTo={redirectTo} />
      </form>
    </AnimatedAuthShell>
  );
}
