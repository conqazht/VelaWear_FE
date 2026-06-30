"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useOtpFlow } from "@/components/auth/use-otp-flow";
import { OtpEntry } from "@/components/auth/otp-entry";

import { AuthShell } from "@/components/auth/auth-shell";
import { BrandMark } from "@/components/shop/brand-mark";
import { FloatingInput } from "@/components/auth/floating-input";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/components/auth/auth-provider";


export function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dobDay, setDobDay] = useState("");
  const [dobMonth, setDobMonth] = useState("");
  const [dobYear, setDobYear] = useState("");
  const [preference, setPreference] = useState("");
  const [isSelectFocused, setIsSelectFocused] = useState(false);
  const [emailConsent, setEmailConsent] = useState(false);
  const [termsConsent, setTermsConsent] = useState(false);
  const [errors, setErrors] = useState<{
    passwordMin?: boolean;
    passwordRules?: boolean;
  }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { register } = useAuth();

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
    email,
    purpose: "REGISTER",
    onVerifySuccess: async () => {
      // Format birthdate as YYYY-MM-DD
      const formattedDay = dobDay.padStart(2, "0");
      const formattedMonth = dobMonth.padStart(2, "0");
      const birthDate = `${dobYear}-${formattedMonth}-${formattedDay}`;

      // Map preference to gender ENUM (MALE, FEMALE, OTHER)
      const gender =
        preference === "womens"
          ? "FEMALE"
          : preference === "mens"
          ? "MALE"
          : "OTHER";

      await register({
        email,
        password,
        fullName: `${firstName} ${lastName}`.trim(),
        birthDate,
        gender,
        avatar: null,
      });

      router.push("/sign-in");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setErrors({});

    const newErrors: typeof errors = {};
    if (password.length < 8) {
      newErrors.passwordMin = true;
    }
    if (
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      newErrors.passwordRules = true;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    await handleRequestOtp();
  };

  if (showOtpStep) {
    return (
      <OtpEntry
        email={email}
        otpCode={otpCode}
        setOtpCode={setOtpCode}
        cooldown={cooldown}
        isSubmitting={isOtpSubmitting}
        error={otpError}
        onVerify={handleVerifyOtp}
        onResend={handleRequestOtp}
        onCancel={resetFlow}
        cancelLabel="Change email"
        actionLabel="Verify & Create Account"
      />
    );
  }
  
  return (
    <AuthShell className="flex min-h-screen items-start justify-center px-4 pt-4 pb-20 md:pt-8">
      <section className="w-full max-w-[460px] bg-[#efe7dc] p-6 md:p-8">
        <div className="mb-6 text-center">
          <Link
            href="/"
            className="inline-block transition-opacity hover:opacity-90"
          >
            <BrandMark className="mx-auto" />
          </Link>
          <h1 className="mt-3 font-serif text-[32px] leading-[1.18] tracking-[-0.0125em] text-[#1c1a18]">
            Now let&apos;s make you a Member.
          </h1>
          <p className="mt-2 text-sm leading-[1.55] text-[#55423d]">
            Enter your details to register a new account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {otpError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-700 text-sm rounded">
              {otpError}
            </div>
          )}

          {/* Email Address */}
          <FloatingInput
            id="email"
            label="Email Address*"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* First Name & Surname */}
          <div className="grid grid-cols-2 gap-4">
            <FloatingInput
              id="firstName"
              label="First Name*"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <FloatingInput
              id="lastName"
              label="Surname*"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div>
            <FloatingInput
              id="password"
              label="Password*"
              type={showPassword ? "text" : "password"}
              value={password}
              inputRef={passwordRef}
              onChange={(e) => {
                setPassword(e.target.value);
                if (isSubmitted) {
                  const newErrors: typeof errors = {};
                  if (e.target.value.length < 8) {
                    newErrors.passwordMin = true;
                  }
                  if (
                    !/[A-Z]/.test(e.target.value) ||
                    !/[a-z]/.test(e.target.value) ||
                    !/[0-9]/.test(e.target.value)
                  ) {
                    newErrors.passwordRules = true;
                  }
                  setErrors(newErrors);
                }
              }}
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
            {isSubmitted && (errors.passwordMin || errors.passwordRules) && (
              <div className="mt-2 flex flex-col gap-1">
                {errors.passwordMin && (
                  <span className="flex items-center gap-2 text-[11px] font-medium text-destructive uppercase tracking-wider">
                    <X className="size-3 text-destructive" strokeWidth={2.5} /> Minimum of 8 characters
                  </span>
                )}
                {errors.passwordRules && (
                  <span className="flex items-center gap-2 text-[11px] font-medium text-destructive uppercase tracking-wider">
                    <X className="size-3 text-destructive" strokeWidth={2.5} /> Uppercase, lowercase letters and one number
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Shopping Preference */}
          <div className="relative w-full">
            <Select
              name="shoppingPreference"
              value={preference}
              onValueChange={(val) => setPreference(val || "")}
              required
            >
              <SelectTrigger
                onFocus={() => setIsSelectFocused(true)}
                onBlur={() => setIsSelectFocused(false)}
                className="w-full !h-14 py-0 px-4 bg-transparent border border-ink rounded-sm text-sm text-[#1c1a18] focus:border-[#964025] focus:ring-0 focus-visible:border-[#964025] focus-visible:ring-0 focus-visible:ring-offset-0 outline-hidden flex items-center justify-between select-none cursor-pointer data-placeholder:text-transparent"
              >
                <SelectValue placeholder=" ">
                  {preference === "mens" ? "Men's" : preference === "womens" ? "Women's" : ""}
                </SelectValue>
              </SelectTrigger>
              <label
                className={cn(
                  "absolute left-4 transition-all duration-200 pointer-events-none",
                  (preference !== "" || isSelectFocused)
                    ? "-top-2.5 text-xs bg-[#efe7dc] px-1"
                    : "top-4 text-sm text-[#55423d]/60 bg-transparent px-0",
                  isSelectFocused ? "text-[#964025]" : "text-[#55423d]"
                )}
              >
                Shopping Preference*
              </label>
              <SelectContent
                alignItemWithTrigger={false}
                side="bottom"
                sideOffset={4}
                className="bg-[#efe7dc] border border-ink rounded-md shadow-none text-ink w-[var(--anchor-width)]"
              >
                <SelectItem value="mens" className="hover:bg-[#964025]/10 focus:bg-[#964025]/10 rounded-sm cursor-pointer py-3 px-4">
                  Men&apos;s
                </SelectItem>
                <SelectItem value="womens" className="hover:bg-[#964025]/10 focus:bg-[#964025]/10 rounded-sm cursor-pointer py-3 px-4">
                  Women&apos;s
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date of Birth */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1c1a18] block mb-3.5">Date of Birth*</label>
            <div className="grid grid-cols-3 gap-4">
              <FloatingInput
                id="dobDay"
                label="Day*"
                value={dobDay}
                onChange={(e) => setDobDay(e.target.value)}
                required
              />
              <FloatingInput
                id="dobMonth"
                label="Month*"
                value={dobMonth}
                onChange={(e) => setDobMonth(e.target.value)}
                required
              />
              <FloatingInput
                id="dobYear"
                label="Year*"
                value={dobYear}
                onChange={(e) => setDobYear(e.target.value)}
                required
              />
            </div>
            <p className="text-[#55423d] text-[13px] opacity-70 mt-1">
              Get a Vela Member Reward every year on your Birthday.
            </p>
          </div>

          {/* Agreements */}
          <div className="space-y-4 mt-4">
            <div className="flex items-start gap-3 cursor-pointer group">
              <Checkbox
                id="emailConsent"
                checked={emailConsent}
                onCheckedChange={(checked) => setEmailConsent(!!checked)}
                className="mt-1 size-5 rounded-sm border-[#1c1a18] data-checked:bg-[#964025] data-checked:border-[#964025] cursor-pointer shrink-0"
              />
              <label htmlFor="emailConsent" className="text-sm text-[#55423d] group-hover:text-[#1c1a18] transition-colors leading-relaxed cursor-pointer select-none">
                Sign up for emails to get updates from Vela on products, offers, and your Member benefits.
              </label>
            </div>
            <div className="flex items-start gap-3 cursor-pointer group">
              <Checkbox
                id="termsConsent"
                checked={termsConsent}
                onCheckedChange={(checked) => setTermsConsent(!!checked)}
                className="mt-1 size-5 rounded-sm border-[#1c1a18] data-checked:bg-[#964025] data-checked:border-[#964025] cursor-pointer shrink-0"
                required
              />
              <label htmlFor="termsConsent" className="text-sm text-[#55423d] group-hover:text-[#1c1a18] transition-colors leading-relaxed cursor-pointer select-none">
                I agree to Vela&apos;s <Link href="#" className="underline hover:text-[#964025]">Privacy Policy</Link> and <Link href="#" className="underline hover:text-[#964025]">Terms of Use</Link>.
              </label>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isOtpSubmitting}
              className="w-full h-14 bg-[#964025] text-white rounded-sm font-medium hover:bg-[#87391f] transition-colors flex items-center justify-center cursor-pointer text-sm uppercase tracking-wider disabled:opacity-50"
            >
              {isOtpSubmitting ? "Creating Account..." : "Create Account"}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-[#55423d]">
            Already a Member? <Link href="/sign-in" className="text-[#1c1a18] underline font-medium hover:text-[#964025]">Sign In</Link>
          </p>
        </div>
      </section>
    </AuthShell>
  );
}
