"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { AnimatedAuthShell } from "@/components/auth/animated-auth-shell";
import { FloatingInput } from "@/components/auth/floating-input";
import { useAuth } from "@/components/auth/auth-provider";
import { GoogleOAuthButton } from "@/components/auth/google-oauth-button";
import type {
  AuthSceneFocus,
  AuthSceneStatus,
} from "@/components/auth/auth-motion-scene";
import { getPostSignInPath, getRoleSessionLabel } from "@/lib/auth/roles";
import { signInSchema } from "@/lib/validations";

type SignInFormValues = z.infer<typeof signInSchema>;

export function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();

  const [apiError, setApiError] = useState<string | null>(null);
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
      setSceneStatus("success");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      router.replace(getPostSignInPath(profile));
    } catch (err: unknown) {
      setSessionRoleLabel(null);
      const errorObj = err as { response?: { data?: { message?: string } } };
      if (errorObj.response?.data?.message) {
        setApiError(errorObj.response.data.message);
      } else {
        setApiError("Invalid email or password. Please try again.");
      }
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

  return (
    <AnimatedAuthShell
      mode="sign-in"
      focus={sceneFocus}
      passwordVisible={showPassword}
      status={sceneStatus}
      title="Sign In"
      description="Enter your email and password to access your account."
      footer={
        <p className="mt-8 text-center text-sm leading-[1.55] text-[#55423d]">
          New to Vela Wear?{" "}
          <Link
            href="/register"
            className="font-medium text-[#964025] underline decoration-[#964025]/30 underline-offset-2 transition-colors hover:text-[#87391f]"
          >
            Join the Vela Community
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="flex flex-col gap-6">
        {apiError && (
          <div className="rounded-sm border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-700">
            {apiError}
          </div>
        )}

        <div>
          <FloatingInput
            id="email"
            label="Email*"
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
            <p className="mt-1 text-xs text-destructive font-semibold uppercase tracking-wider">{errors.email.message}</p>
          )}
        </div>

        <div>
          <FloatingInput
            id="password"
            label="Password*"
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
          {errors.password && (
            <p className="mt-1 text-xs text-destructive font-semibold uppercase tracking-wider">{errors.password.message}</p>
          )}
          <div className="mt-2 flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm leading-[1.55] text-[#1c1a18] transition-colors hover:text-[#964025]"
            >
              Forgot Password?
            </Link>
          </div>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex h-12 w-full items-center justify-center rounded-[12px] bg-[#964025] text-sm font-medium uppercase tracking-wider text-white transition-colors hover:bg-[#87391f] disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting
            ? sessionRoleLabel
              ? `Checking ${sessionRoleLabel} session...`
              : "Signing In..."
            : "Sign In"}
        </button>

        <div className="relative flex items-center mt-2">
          <div className="flex-grow border-t border-[#1c1a18]/10"></div>
          <span className="flex-shrink-0 mx-4 text-xs uppercase tracking-wider text-[#1c1a18]/50">Or</span>
          <div className="flex-grow border-t border-[#1c1a18]/10"></div>
        </div>

        <GoogleOAuthButton />
      </form>
    </AnimatedAuthShell>
  );
}
