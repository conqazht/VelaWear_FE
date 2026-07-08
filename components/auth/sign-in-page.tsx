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
import type {
  AuthSceneFocus,
  AuthSceneStatus,
} from "@/components/auth/auth-motion-scene";
import { signInSchema } from "@/lib/validations";

type SignInFormValues = z.infer<typeof signInSchema>;

export function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();

  const [apiError, setApiError] = useState<string | null>(null);
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
    setSceneStatus("idle");

    try {
      await signIn(data.email, data.password);
      setSceneStatus("success");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      router.push("/");
    } catch (err: unknown) {
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
          {isSubmitting ? "Signing In..." : "Sign In"}
        </button>

        <div className="relative flex items-center mt-2">
          <div className="flex-grow border-t border-[#1c1a18]/10"></div>
          <span className="flex-shrink-0 mx-4 text-xs uppercase tracking-wider text-[#1c1a18]/50">Or</span>
          <div className="flex-grow border-t border-[#1c1a18]/10"></div>
        </div>

        <button
          type="button"
          className="flex h-12 w-full items-center justify-center gap-2.5 rounded-[12px] border border-[#1c1a18]/20 bg-transparent text-sm font-medium text-[#1c1a18] transition-colors hover:bg-black/5 cursor-pointer"
        >
          {/* Note: In a real app we'd use a colored Google SVG. For now, SimpleIcon works. */}
          <svg className="size-[18px]" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
            <path d="M1 1h22v22H1z" fill="none" />
          </svg>
          Continue with Google
        </button>
      </form>
    </AnimatedAuthShell>
  );
}
