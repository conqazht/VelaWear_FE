import Link from "next/link";
import { Eye } from "lucide-react";

import { AuthField } from "@/components/auth/auth-field";
import { AuthShell } from "@/components/auth/auth-shell";

export function SignInPage() {
  return (
    <AuthShell
      includeHeader
      className="flex min-h-[calc(100vh-71px)] flex-col items-center px-4 pb-24 pt-[153px] md:pt-[214px]"
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

        <form className="space-y-6">
          <AuthField
            aria-label="Email Address"
            autoComplete="email"
            placeholder="Email Address*"
            type="email"
          />
          <div>
            <AuthField
              aria-label="Password"
              autoComplete="current-password"
              placeholder="Password*"
              type="password"
              trailing={<Eye className="size-[22px]" strokeWidth={1.5} />}
            />
            <div className="mt-2 flex justify-end">
              <Link href="#" className="text-base leading-[1.55] text-[#1c1a18]">
                Forgot Password?
              </Link>
            </div>
          </div>
          <button
            type="submit"
            className="flex h-[46px] w-full items-center justify-center rounded bg-[#964025] text-sm font-medium tracking-[0.03125em] text-white transition-colors hover:bg-[#87391f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#964025]/30"
          >
            Sign In
          </button>
        </form>
      </section>

      <p className="mt-12 text-center text-base leading-[1.55] text-[#55423d]">
        New to Vela Wear?{" "}
        <Link
          href="/register"
          className="text-[#964025] underline decoration-[#964025]/30 underline-offset-2"
        >
          Join the Vela Community
        </Link>
      </p>
    </AuthShell>
  );
}
