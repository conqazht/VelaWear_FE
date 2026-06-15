import Link from "next/link";
import { ArrowRight, Eye, X } from "lucide-react";

import { AuthField } from "@/components/auth/auth-field";
import { AuthShell } from "@/components/auth/auth-shell";

export function RegisterPage() {
  return (
    <AuthShell className="flex min-h-screen items-start justify-center px-4 py-[88px]">
      <section className="w-full max-w-[460px] bg-[#efe7dc] p-6 md:p-8">
        <div className="mb-6 text-center">
          <Link
            href="/"
            className="font-serif text-[32px] leading-[1.18] tracking-[-0.025em]"
          >
            Vela Wear
          </Link>
          <h1 className="mt-2 font-serif text-[32px] leading-[1.18] tracking-[-0.0125em]">
            Now let&apos;s make you a Member.
          </h1>
          <p className="mt-2 text-base leading-[1.55] text-[#55423d]">
            We&apos;ve sent a code to your email.
          </p>
        </div>

        <form className="space-y-6">
          <div>
            <div className="mb-2 flex items-baseline justify-between">
              <label className="text-base font-medium leading-[1.4]">Code</label>
              <button
                type="button"
                className="text-[11px] font-medium uppercase leading-[1.4] tracking-[0.164em] text-[#964025]"
              >
                Resend Code
              </button>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <input
                  aria-label={`Verification code digit ${index + 1}`}
                  className="h-14 w-full rounded border border-[#e3dccf] bg-[#f7f4ef] text-center text-base font-medium text-[#1c1a18] outline-none focus:border-[#964025] focus:ring-2 focus:ring-[#964025]/15"
                  inputMode="numeric"
                  key={index}
                  maxLength={1}
                  placeholder="·"
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <LabeledField
              autoComplete="given-name"
              label="First Name"
              placeholder="First Name"
            />
            <LabeledField
              autoComplete="family-name"
              label="Surname"
              placeholder="Surname"
            />
          </div>

          <div>
            <LabeledField
              autoComplete="new-password"
              label="Password"
              placeholder="Password"
              type="password"
              trailing={<Eye className="size-[22px]" strokeWidth={1.5} />}
            />
            <div className="mt-2 grid gap-3 opacity-70 sm:grid-cols-[150px_1fr]">
              <PasswordHint>Minimum of 8 characters</PasswordHint>
              <PasswordHint>Uppercase, lowercase, and one number</PasswordHint>
            </div>
          </div>

          <div>
            <p className="mb-2 text-base font-medium leading-[1.4]">
              Shopping Preference
            </p>
            <div className="grid grid-cols-2 gap-4">
              <PreferenceButton>Men&apos;s</PreferenceButton>
              <PreferenceButton>Women&apos;s</PreferenceButton>
            </div>
          </div>

          <div>
            <LabeledField
              autoComplete="bday"
              label="Date of Birth"
              placeholder="mm/dd/yyyy"
            />
            <p className="mt-2 text-[13px] leading-[1.55] text-[#55423d]/70">
              Get a Vela Member Reward every year on your Birthday.
            </p>
          </div>

          <div className="space-y-4 border-t border-[#e3dccf] pt-[25px]">
            <Agreement>
              Sign up for emails to get updates from Vela on products, offers,
              and your Member benefits.
            </Agreement>
            <Agreement>
              I agree to Vela&apos;s{" "}
              <Link href="#" className="underline underline-offset-2">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link href="#" className="underline underline-offset-2">
                Terms of Use
              </Link>
              .
            </Agreement>
          </div>

          <button
            type="submit"
            className="flex h-12 w-full items-center justify-center gap-2 rounded bg-[#964025] text-sm font-medium tracking-[0.03125em] text-white transition-colors hover:bg-[#87391f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#964025]/30"
          >
            Create Account
            <ArrowRight className="size-4" />
          </button>
        </form>

        <p className="mt-8 text-center text-base leading-[1.55] text-[#55423d]">
          Already a Member?{" "}
          <Link href="/sign-in" className="text-[#1c1a18] underline underline-offset-2">
            Sign In
          </Link>
        </p>
      </section>
    </AuthShell>
  );
}

function LabeledField({
  label,
  ...props
}: React.ComponentProps<typeof AuthField> & { label: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-base font-medium leading-[1.4]">
        {label}
      </span>
      <AuthField {...props} />
    </label>
  );
}

function PasswordHint({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-[10px] text-[11px] font-medium uppercase leading-[1.4] tracking-[0.164em] text-[#55423d]">
      <X className="size-2 shrink-0" strokeWidth={2} />
      {children}
    </span>
  );
}

function PreferenceButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="flex h-12 items-center justify-center rounded border border-[#e3dccf] bg-[#f7f4ef] text-base font-medium text-[#1c1a18] transition-colors hover:border-[#964025]/50"
    >
      {children}
    </button>
  );
}

function Agreement({ children }: { children: React.ReactNode }) {
  return (
    <label className="flex items-start gap-3 text-base leading-[1.55] text-[#55423d]">
      <input
        className="mt-1 size-5 shrink-0 rounded border border-[#e3dccf] bg-[#f7f4ef] accent-[#964025]"
        type="checkbox"
      />
      <span>{children}</span>
    </label>
  );
}
