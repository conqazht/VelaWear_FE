"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useOtpFlow } from "@/components/auth/use-otp-flow";
import { OtpEntry } from "@/components/auth/otp-entry";
import { AnimatedAuthShell } from "@/components/auth/animated-auth-shell";
import { FloatingInput } from "@/components/auth/floating-input";
import { PasswordRequirements } from "@/components/auth/password-requirements";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { GoogleOAuthButton } from "@/components/auth/google-oauth-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/components/auth/auth-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import type { AuthSceneFocus, AuthSceneStatus } from "@/components/auth/auth-motion-scene";
import type { AuthErrorMessageKey } from "@/lib/i18n/messages/auth-errors";

export function RegisterPage() {
  const { t } = useI18n();
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
    email?: AuthErrorMessageKey;
    firstName?: AuthErrorMessageKey;
    lastName?: AuthErrorMessageKey;
    passwordMin?: boolean;
    passwordRules?: boolean;
    gender?: AuthErrorMessageKey;
    dob?: AuthErrorMessageKey;
    terms?: AuthErrorMessageKey;
  }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);
  const dobMonthRef = useRef<HTMLInputElement>(null);
  const dobYearRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { register } = useAuth();

  const [sceneFocus, setSceneFocus] = useState<AuthSceneFocus>("none");
  const [sceneStatus, setSceneStatus] = useState<AuthSceneStatus>("idle");

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
    onVerifySuccess: async (proofToken) => {
      // Format birthdate as YYYY-MM-DD
      const formattedDay = dobDay.padStart(2, "0");
      const formattedMonth = dobMonth.padStart(2, "0");
      const birthDate = `${dobYear}-${formattedMonth}-${formattedDay}`;

      // Map preference to gender ENUM (MALE, FEMALE, OTHER)
      const gender = preference === "womens" ? "FEMALE" : preference === "mens" ? "MALE" : "OTHER";

      await register({
        email,
        password,
        fullName: `${firstName} ${lastName}`.trim(),
        birthDate,
        gender,
        otpProofToken: proofToken,
      });

      router.push("/sign-in");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setIsSubmitted(true);
    setErrors({});
    setSceneStatus("idle");

    const newErrors: typeof errors = {};

    // 1. Email validation
    if (!email.trim()) {
      newErrors.email = "auth.validation.required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "auth.validation.invalidEmail";
    }

    // 2. Names validation
    if (!firstName.trim()) {
      newErrors.firstName = "auth.validation.required";
    }
    if (!lastName.trim()) {
      newErrors.lastName = "auth.validation.required";
    }

    // 3. Password validation
    if (!password) {
      newErrors.passwordMin = true;
    } else {
      if (password.length < 8) {
        newErrors.passwordMin = true;
      }
      if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
        newErrors.passwordRules = true;
      }
    }

    // 4. Gender validation
    if (!preference) {
      newErrors.gender = "auth.validation.required";
    }

    // 5. Date of Birth validation
    const day = parseInt(dobDay, 10);
    const month = parseInt(dobMonth, 10);
    const year = parseInt(dobYear, 10);
    const currentYear = new Date().getFullYear();

    if (!dobDay || !dobMonth || !dobYear) {
      newErrors.dob = "auth.validation.required";
    } else if (
      isNaN(day) ||
      day < 1 ||
      day > 31 ||
      isNaN(month) ||
      month < 1 ||
      month > 12 ||
      isNaN(year) ||
      year < 1900 ||
      year > currentYear
    ) {
      newErrors.dob = "auth.validation.invalidDate";
    }

    // 6. Terms consent validation
    if (!termsConsent) {
      newErrors.terms = "auth.validation.termsRequired";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSceneStatus("error");
      setTimeout(() => setSceneStatus("idle"), 850);
      return;
    }

    const success = await handleRequestOtp();
    if (!success) {
      setSceneStatus("error");
      setTimeout(() => setSceneStatus("idle"), 850);
    }
  };

  return (
    <AnimatedAuthShell
      mode="register"
      focus={sceneFocus}
      passwordVisible={showPassword}
      status={sceneStatus}
      title={showOtpStep ? t("auth.register.verifyTitle") : t("auth.register.title")}
      description={
        showOtpStep
          ? t("auth.register.verifyDescription", { email })
          : t("auth.register.description")
      }
      footer={
        !showOtpStep && (
          <p className="mt-8 border-none text-center text-sm leading-[1.55] text-[#55423d]">
            {t("auth.register.alreadyMember")}{" "}
            <Link
              href="/sign-in"
              className="border-none font-medium text-[#b5573a] underline decoration-[#b5573a]/30 underline-offset-2 transition-colors hover:text-[#8f4329]"
            >
              {t("auth.common.signIn")}
            </Link>
          </p>
        )
      }
    >
      {showOtpStep ? (
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
          cancelLabel={t("auth.otp.changeEmail")}
          actionLabel={t("auth.register.verifyAndCreate")}
          plain={true}
        />
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 border-none sm:gap-3.5">
          {otpError && (
            <div className="rounded-[12px] border border-solid border-red-500/20 bg-red-500/10 p-2.5 text-xs text-red-700 sm:text-sm">
              {otpError}
            </div>
          )}

          <div className="border-none">
            <FloatingInput
              id="email"
              label={t("auth.common.email")}
              type="email"
              value={email}
              error={!!errors.email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) {
                  setErrors((prev) => {
                    const copy = { ...prev };
                    delete copy.email;
                    return copy;
                  });
                }
              }}
              onFocus={() => setSceneFocus("email")}
              onBlur={() => setSceneFocus("none")}
            />
            {errors.email && (
              <p className="text-destructive mt-1 text-xs font-semibold tracking-wider uppercase">
                {t(errors.email)}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 border-none sm:gap-4">
            <div>
              <FloatingInput
                id="firstName"
                label={t("auth.register.firstName")}
                type="text"
                value={firstName}
                error={!!errors.firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  if (errors.firstName) {
                    setErrors((prev) => {
                      const copy = { ...prev };
                      delete copy.firstName;
                      return copy;
                    });
                  }
                }}
                onFocus={() => setSceneFocus("email")}
                onBlur={() => setSceneFocus("none")}
              />
              {errors.firstName && (
                <p className="text-destructive mt-1 text-xs font-semibold tracking-wider uppercase">
                  {t(errors.firstName)}
                </p>
              )}
            </div>
            <div>
              <FloatingInput
                id="lastName"
                label={t("auth.register.lastName")}
                type="text"
                value={lastName}
                error={!!errors.lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  if (errors.lastName) {
                    setErrors((prev) => {
                      const copy = { ...prev };
                      delete copy.lastName;
                      return copy;
                    });
                  }
                }}
                onFocus={() => setSceneFocus("email")}
                onBlur={() => setSceneFocus("none")}
              />
              {errors.lastName && (
                <p className="text-destructive mt-1 text-xs font-semibold tracking-wider uppercase">
                  {t(errors.lastName)}
                </p>
              )}
            </div>
          </div>

          {/* Password */}
          <div className="border-none">
            <FloatingInput
              id="password"
              label={t("auth.common.password")}
              type={showPassword ? "text" : "password"}
              value={password}
              inputRef={passwordRef}
              error={!!errors.passwordMin || !!errors.passwordRules}
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
                  } else {
                    delete newErrors.passwordRules;
                  }
                  setErrors(newErrors);
                }
              }}
              onFocus={() => setSceneFocus("password")}
              onBlur={() => setSceneFocus("none")}
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
                  aria-label={t(
                    showPassword ? "auth.common.hidePassword" : "auth.common.showPassword",
                  )}
                  className="cursor-pointer border-none bg-transparent p-1 transition-opacity hover:opacity-85"
                >
                  {showPassword ? (
                    <EyeOff className="text-ink size-[22px]" />
                  ) : (
                    <Eye className="text-ink size-[22px]" />
                  )}
                </button>
              }
            />
            {(password.length > 0 || isSubmitted) && (
              <PasswordRequirements
                password={password}
                showTitle={false}
                className="mt-2 border-none px-1"
              />
            )}
          </div>

          {/* Gender & Date of Birth */}
          <div className="grid grid-cols-2 gap-4 border-none">
            {/* Gender */}
            <div className="flex w-full flex-col gap-2 border-none">
              <label
                htmlFor="gender"
                className="block border-none text-[14px] font-semibold text-[#1c1a18] select-none"
              >
                {t("auth.register.gender")}
              </label>
              <div className="relative w-full border-none">
                <Select
                  name="shoppingPreference"
                  value={preference}
                  onValueChange={(val) => {
                    setPreference(val || "");
                    if (val && errors.gender) {
                      setErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.gender;
                        return copy;
                      });
                    }
                  }}
                >
                  <SelectTrigger
                    id="gender"
                    onFocus={() => setIsSelectFocused(true)}
                    onBlur={() => setIsSelectFocused(false)}
                    className={cn(
                      "flex !h-12 w-full cursor-pointer items-center justify-between rounded-[12px] border border-solid bg-white/60 px-4 py-3 text-[15px] text-[#1c1a18] transition-all outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0",
                      errors.gender
                        ? "border-red-500 bg-white/60 focus:border-red-500"
                        : isSelectFocused
                          ? "border-[#b5573a] bg-white/85 ring-2 ring-black/5"
                          : "border-black/20",
                    )}
                  >
                    <SelectValue placeholder={t("auth.register.selectGender")}>
                      {preference === "mens"
                        ? t("auth.register.male")
                        : preference === "womens"
                          ? t("auth.register.female")
                          : ""}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent
                    alignItemWithTrigger={false}
                    side="bottom"
                    sideOffset={4}
                    className="text-ink w-[var(--anchor-width)] rounded-[12px] border border-black/20 bg-[#efe7dc] shadow-none"
                  >
                    <SelectItem
                      value="mens"
                      className="cursor-pointer rounded-sm px-4 py-3 hover:bg-[#b5573a]/10 focus:bg-[#b5573a]/10"
                    >
                      {t("auth.register.male")}
                    </SelectItem>
                    <SelectItem
                      value="womens"
                      className="cursor-pointer rounded-sm px-4 py-3 hover:bg-[#b5573a]/10 focus:bg-[#b5573a]/10"
                    >
                      {t("auth.register.female")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {errors.gender && (
                <p className="text-destructive mt-1 text-xs font-semibold tracking-wider uppercase">
                  {t(errors.gender)}
                </p>
              )}
            </div>

            {/* Date of Birth */}
            <div className="flex w-full flex-col gap-2 border-none">
              <label className="block border-none text-[14px] font-semibold text-[#1c1a18] select-none">
                {t("auth.register.dateOfBirth")}
              </label>
              <div className="grid w-full grid-cols-4 gap-2 border-none">
                <input
                  id="dobDay"
                  aria-label={t("auth.register.dayAria")}
                  type="text"
                  placeholder="DD"
                  value={dobDay}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d*$/.test(val) && val.length <= 2) {
                      setDobDay(val);
                      if (val.length === 2) {
                        dobMonthRef.current?.focus();
                      }
                      if (errors.dob) {
                        setErrors((prev) => {
                          const copy = { ...prev };
                          delete copy.dob;
                          return copy;
                        });
                      }
                    }
                  }}
                  onFocus={() => setSceneFocus("email")}
                  onBlur={() => setSceneFocus("none")}
                  className={cn(
                    "col-span-1 h-12 w-full rounded-[12px] border border-solid px-1 py-3 text-center text-[15px] text-[#1c1a18] transition-all outline-none focus:ring-2 focus:ring-black/5",
                    errors.dob
                      ? "border-red-500 bg-white/60 focus:border-red-500"
                      : "border-black/20 bg-white/60 focus:border-[#b5573a] focus:bg-white/85",
                  )}
                />
                <input
                  ref={dobMonthRef}
                  id="dobMonth"
                  aria-label={t("auth.register.monthAria")}
                  type="text"
                  placeholder="MM"
                  value={dobMonth}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d*$/.test(val) && val.length <= 2) {
                      setDobMonth(val);
                      if (val.length === 2) {
                        dobYearRef.current?.focus();
                      }
                      if (errors.dob) {
                        setErrors((prev) => {
                          const copy = { ...prev };
                          delete copy.dob;
                          return copy;
                        });
                      }
                    }
                  }}
                  onFocus={() => setSceneFocus("email")}
                  onBlur={() => setSceneFocus("none")}
                  className={cn(
                    "col-span-1 h-12 w-full rounded-[12px] border border-solid px-1 py-3 text-center text-[15px] text-[#1c1a18] transition-all outline-none focus:ring-2 focus:ring-black/5",
                    errors.dob
                      ? "border-red-500 bg-white/60 focus:border-red-500"
                      : "border-black/20 bg-white/60 focus:border-[#b5573a] focus:bg-white/85",
                  )}
                />
                <input
                  ref={dobYearRef}
                  id="dobYear"
                  aria-label={t("auth.register.yearAria")}
                  type="text"
                  placeholder="YYYY"
                  value={dobYear}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d*$/.test(val) && val.length <= 4) {
                      setDobYear(val);
                      if (errors.dob) {
                        setErrors((prev) => {
                          const copy = { ...prev };
                          delete copy.dob;
                          return copy;
                        });
                      }
                    }
                  }}
                  onFocus={() => setSceneFocus("email")}
                  onBlur={() => setSceneFocus("none")}
                  className={cn(
                    "col-span-2 h-12 w-full rounded-[12px] border border-solid px-1 py-3 text-center text-[15px] text-[#1c1a18] transition-all outline-none focus:ring-2 focus:ring-black/5",
                    errors.dob
                      ? "border-red-500 bg-white/60 focus:border-red-500"
                      : "border-black/20 bg-white/60 focus:border-[#b5573a] focus:bg-white/85",
                  )}
                />
              </div>
              {errors.dob && (
                <p className="text-destructive mt-1 text-xs font-semibold tracking-wider uppercase">
                  {t(errors.dob)}
                </p>
              )}
            </div>
          </div>

          {/* Agreements */}
          <div className="mt-2 space-y-2.5 border-none">
            <div className="group flex cursor-pointer items-start gap-2.5 border-none">
              <Checkbox
                id="emailConsent"
                checked={emailConsent}
                onCheckedChange={(checked) => setEmailConsent(!!checked)}
                className="mt-0.5 size-4.5 shrink-0 cursor-pointer rounded-[4px] border-[#1c1a18]/30 data-checked:border-[#b5573a] data-checked:bg-[#b5573a]"
              />
              <label
                htmlFor="emailConsent"
                className="cursor-pointer border-none text-xs leading-relaxed text-[#55423d] transition-colors select-none group-hover:text-[#1c1a18] sm:text-sm"
              >
                {t("auth.register.emailConsent")}
              </label>
            </div>
            <div className="group flex cursor-pointer items-start gap-2.5 border-none">
              <Checkbox
                id="termsConsent"
                checked={termsConsent}
                onCheckedChange={(checked) => {
                  setTermsConsent(!!checked);
                  if (checked && errors.terms) {
                    setErrors((prev) => {
                      const copy = { ...prev };
                      delete copy.terms;
                      return copy;
                    });
                  }
                }}
                className={cn(
                  "mt-0.5 size-4.5 shrink-0 cursor-pointer rounded-[4px] transition-all duration-200",
                  errors.terms
                    ? "border-red-500 bg-red-500/10 shadow-[0_0_0_2px_rgba(239,68,68,0.2)]"
                    : "border-[#1c1a18]/30 data-checked:border-[#b5573a] data-checked:bg-[#b5573a]",
                )}
              />
              <label
                htmlFor="termsConsent"
                className="cursor-pointer border-none text-xs leading-relaxed text-[#55423d] transition-colors select-none group-hover:text-[#1c1a18] sm:text-sm"
              >
                {t("auth.register.termsPrefix")}{" "}
                <Link href="#" className="border-none underline hover:text-[#b5573a]">
                  {t("auth.register.privacyPolicy")}
                </Link>{" "}
                {t("auth.register.termsJoin")}{" "}
                <Link href="#" className="border-none underline hover:text-[#b5573a]">
                  {t("auth.register.termsOfUse")}
                </Link>
                .
              </label>
            </div>
          </div>

          {/* Submit Action */}
          <div className="border-none pt-2 sm:pt-3">
            <button
              type="submit"
              disabled={isOtpSubmitting}
              className="flex h-11 w-full cursor-pointer items-center justify-center rounded-[12px] border-none bg-[#b5573a] text-sm font-medium tracking-wider text-white uppercase shadow-sm transition-colors hover:bg-[#8f4329] disabled:opacity-50 sm:h-12"
            >
              {isOtpSubmitting ? t("auth.register.creating") : t("auth.register.create")}
            </button>

            <div className="relative mt-2.5 flex items-center sm:mt-3">
              <div className="flex-grow border-t border-[#1c1a18]/10"></div>
              <span className="mx-4 flex-shrink-0 text-xs tracking-wider text-[#1c1a18]/50 uppercase">
                {t("auth.common.or")}
              </span>
              <div className="flex-grow border-t border-[#1c1a18]/10"></div>
            </div>

            <GoogleOAuthButton className="mt-2.5 sm:mt-3" />
          </div>
        </form>
      )}
    </AnimatedAuthShell>
  );
}
