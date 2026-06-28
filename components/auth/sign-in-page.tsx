"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/auth-provider";

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  trailing?: React.ReactNode;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

function FloatingInput({
  label,
  id,
  trailing,
  className,
  type = "text",
  inputRef,
  ...props
}: FloatingInputProps) {
  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type={type}
        id={id}
        placeholder=" "
        className={cn(
          "peer w-full h-14 px-4 bg-transparent border border-ink rounded-sm text-sm text-[#1c1a18] outline-none transition-all focus:border-[#964025] focus:ring-0",
          trailing && "pr-12",
          className
        )}
        {...props}
      />
      <label
        htmlFor={id}
        className="absolute left-4 -top-2.5 px-1 bg-[#efe7dc] text-xs text-[#55423d] transition-all duration-200
                   peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:text-[#55423d]/60 peer-placeholder-shown:bg-transparent peer-placeholder-shown:px-0
                   peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-[#964025] peer-focus:bg-[#efe7dc] peer-focus:px-1
                   pointer-events-none"
      >
        {label}
      </label>
      {trailing && (
        <div className="absolute inset-y-0 right-3 flex items-center text-ink">
          {trailing}
        </div>
      )}
    </div>
  );
}

export function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await signIn(email, password);
      router.push("/");
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      if (apiError.response?.data?.message) {
        setError(apiError.response.data.message);
      } else {
        setError("Invalid email or password. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      includeHeader
      className="flex min-h-[calc(100vh-71px)] flex-col items-center px-4 pb-24 pt-10 md:pt-16"
    >
      <section className="w-full max-w-[448px] rounded bg-[#efe7dc] px-6 pb-12 pt-8 shadow-[0_1px_1px_rgba(0,0,0,0.05)] md:px-8">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-[40px] font-normal leading-[1.12] tracking-[-0.02em]">
            Sign In
          </h1>
          <p className="mx-auto mt-[15px] max-w-[348px] text-base leading-[1.55] text-[#55423d]">
            Enter your email and password to access your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-700 text-sm rounded">
              {error}
            </div>
          )}

          <FloatingInput
            id="email"
            label="Email Address*"
            autoComplete="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div>
            <FloatingInput
              id="password"
              label="Password*"
              autoComplete="current-password"
              type={showPassword ? "text" : "password"}
              inputRef={passwordRef}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              trailing={
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setShowPassword(!showPassword);
                    setTimeout(() => {
                      passwordRef.current?.focus();
                    }, 0);
                  }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="p-1 hover:opacity-85 transition-opacity cursor-pointer"
                >
                  {showPassword ? <EyeOff className="size-[22px] text-ink" /> : <Eye className="size-[22px] text-ink" />}
                </button>
              }
            />
            <div className="mt-2 flex justify-end">
              <Link href="#" className="text-sm leading-[1.55] text-[#1c1a18] hover:text-[#964025] transition-colors">
                Forgot Password?
              </Link>
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex h-14 w-full items-center justify-center rounded-sm bg-[#964025] text-sm font-medium tracking-[0.03125em] text-white transition-colors hover:bg-[#87391f] cursor-pointer uppercase tracking-wider disabled:opacity-50"
          >
            {isSubmitting ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </section>

      <p className="mt-12 text-center text-sm leading-[1.55] text-[#55423d]">
        New to Vela Wear?{" "}
        <Link
          href="/register"
          className="text-[#964025] underline decoration-[#964025]/30 underline-offset-2 hover:text-[#87391f] transition-colors font-medium"
        >
          Join the Vela Community
        </Link>
      </p>
    </AuthShell>
  );
}
