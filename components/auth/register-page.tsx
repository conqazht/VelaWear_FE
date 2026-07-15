"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useOtpFlow } from "@/components/auth/use-otp-flow";
import { OtpEntry } from "@/components/auth/otp-entry";
import { AnimatedAuthShell } from "@/components/auth/animated-auth-shell";
import { FloatingInput } from "@/components/auth/floating-input";
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
      if (
        !/[A-Z]/.test(password) ||
        !/[a-z]/.test(password) ||
        !/[0-9]/.test(password)
      ) {
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
      isNaN(day) || day < 1 || day > 31 ||
      isNaN(month) || month < 1 || month > 12 ||
      isNaN(year) || year < 1900 || year > currentYear
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
          <p className="mt-8 text-center text-sm leading-[1.55] text-[#55423d] border-none">
            {t("auth.register.alreadyMember")} {" "}
            <Link
              href="/sign-in"
              className="font-medium text-[#964025] underline decoration-[#964025]/30 underline-offset-2 transition-colors hover:text-[#87391f] border-none"
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
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 border-none">
          {otpError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-700 text-sm rounded border-solid">
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
              <p className="mt-1 text-xs text-destructive font-semibold uppercase tracking-wider">
                {t(errors.email)}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 border-none">
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
                <p className="mt-1 text-xs text-destructive font-semibold uppercase tracking-wider">
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
                <p className="mt-1 text-xs text-destructive font-semibold uppercase tracking-wider">
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
                  aria-label={t(showPassword ? "auth.common.hidePassword" : "auth.common.showPassword")}
                  className="p-1 hover:opacity-85 transition-opacity cursor-pointer border-none bg-transparent"
                >
                  {showPassword ? <EyeOff className="size-[22px] text-ink" /> : <Eye className="size-[22px] text-ink" />}
                </button>
              }
            />
            {isSubmitted && (errors.passwordMin || errors.passwordRules) && (
              <div className="mt-2 flex flex-col gap-1 border-none">
                {errors.passwordMin && (
                  <span className="flex items-center gap-2 text-[11px] font-medium text-destructive uppercase tracking-wider border-none">
                    <X className="size-3 text-destructive" strokeWidth={2.5} />{" "}
                    {t("auth.validation.passwordMin")}
                  </span>
                )}
                {errors.passwordRules && (
                  <span className="flex items-center gap-2 text-[11px] font-medium text-destructive uppercase tracking-wider border-none">
                    <X className="size-3 text-destructive" strokeWidth={2.5} />{" "}
                    {t("auth.validation.passwordRules")}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Gender & Date of Birth */}
          <div className="grid grid-cols-2 gap-4 border-none">
            {/* Gender */}
            <div className="w-full flex flex-col gap-2 border-none">
              <label
                htmlFor="gender"
                className="block text-[14px] font-semibold text-[#1c1a18] select-none border-none"
              >
                {t("auth.register.gender")}
              </label>
              <div className="relative w-full border-none">
                <Select
                  name="shoppingPreference"
                  value={preference}
                  onValueChange={(val) => {
                    setPreference(val || "")
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
                      "w-full px-4 py-3 rounded-[12px] border border-solid transition-all bg-white/60 text-[15px] text-[#1c1a18] outline-none flex items-center justify-between cursor-pointer focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 !h-12",
                      errors.gender
                        ? "border-red-500 bg-white/60 focus:border-red-500"
                        : isSelectFocused
                        ? "border-[#964025] bg-white/85 ring-2 ring-black/5"
                        : "border-black/20"
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
                    className="bg-[#efe7dc] border border-black/20 rounded-[12px] shadow-none text-ink w-[var(--anchor-width)]"
                  >
                    <SelectItem value="mens" className="hover:bg-[#964025]/10 focus:bg-[#964025]/10 rounded-sm cursor-pointer py-3 px-4">
                      {t("auth.register.male")}
                    </SelectItem>
                    <SelectItem value="womens" className="hover:bg-[#964025]/10 focus:bg-[#964025]/10 rounded-sm cursor-pointer py-3 px-4">
                      {t("auth.register.female")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {errors.gender && (
                <p className="mt-1 text-xs text-destructive font-semibold uppercase tracking-wider">
                  {t(errors.gender)}
                </p>
              )}
            </div>

            {/* Date of Birth */}
            <div className="w-full flex flex-col gap-2 border-none">
              <label className="block text-[14px] font-semibold text-[#1c1a18] select-none border-none">
                {t("auth.register.dateOfBirth")}
              </label>
              <div className="grid grid-cols-4 gap-2 w-full border-none">
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
                    "col-span-1 w-full text-center px-1 py-3 rounded-[12px] border border-solid transition-all text-[15px] text-[#1c1a18] outline-none focus:ring-2 focus:ring-black/5 h-12",
                    errors.dob
                      ? "border-red-500 bg-white/60 focus:border-red-500"
                      : "border-black/20 focus:border-[#964025] bg-white/60 focus:bg-white/85"
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
                    "col-span-1 w-full text-center px-1 py-3 rounded-[12px] border border-solid transition-all text-[15px] text-[#1c1a18] outline-none focus:ring-2 focus:ring-black/5 h-12",
                    errors.dob
                      ? "border-red-500 bg-white/60 focus:border-red-500"
                      : "border-black/20 focus:border-[#964025] bg-white/60 focus:bg-white/85"
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
                    "col-span-2 w-full text-center px-1 py-3 rounded-[12px] border border-solid transition-all text-[15px] text-[#1c1a18] outline-none focus:ring-2 focus:ring-black/5 h-12",
                    errors.dob
                      ? "border-red-500 bg-white/60 focus:border-red-500"
                      : "border-black/20 focus:border-[#964025] bg-white/60 focus:bg-white/85"
                  )}
                />
              </div>
              {errors.dob && (
                <p className="mt-1 text-xs text-destructive font-semibold uppercase tracking-wider">
                  {t(errors.dob)}
                </p>
              )}
            </div>
          </div>

          {/* Agreements */}
          <div className="space-y-4 mt-4 border-none">
            <div className="flex items-start gap-3 cursor-pointer group border-none">
              <Checkbox
                id="emailConsent"
                checked={emailConsent}
                onCheckedChange={(checked) => setEmailConsent(!!checked)}
                className="mt-1 size-5 rounded-[4px] border-[#1c1a18]/30 data-checked:bg-[#964025] data-checked:border-[#964025] cursor-pointer shrink-0"
              />
              <label htmlFor="emailConsent" className="text-sm text-[#55423d] group-hover:text-[#1c1a18] transition-colors leading-relaxed cursor-pointer select-none border-none">
                {t("auth.register.emailConsent")}
              </label>
            </div>
            <div className="flex items-start gap-3 cursor-pointer group border-none">
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
                  "mt-1 size-5 rounded-[4px] cursor-pointer shrink-0 transition-all duration-200",
                  errors.terms
                    ? "border-red-500 bg-red-500/10 shadow-[0_0_0_2px_rgba(239,68,68,0.2)]"
                    : "border-[#1c1a18]/30 data-checked:bg-[#964025] data-checked:border-[#964025]"
                )}
              />
              <label htmlFor="termsConsent" className="text-sm text-[#55423d] group-hover:text-[#1c1a18] transition-colors leading-relaxed cursor-pointer select-none border-none">
                {t("auth.register.termsPrefix")} {" "}
                <Link href="#" className="underline hover:text-[#964025] border-none">
                  {t("auth.register.privacyPolicy")}
                </Link>{" "}
                {t("auth.register.termsJoin")} {" "}
                <Link href="#" className="underline hover:text-[#964025] border-none">
                  {t("auth.register.termsOfUse")}
                </Link>
                .
              </label>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-none">
            <button
              type="submit"
              disabled={isOtpSubmitting}
              className="w-full h-12 bg-[#964025] text-white rounded-[12px] font-medium hover:bg-[#87391f] transition-colors flex items-center justify-center cursor-pointer text-sm uppercase tracking-wider disabled:opacity-50 border-none"
            >
              {isOtpSubmitting ? t("auth.register.creating") : t("auth.register.create")}
            </button>

            <div className="relative flex items-center mt-4">
              <div className="flex-grow border-t border-[#1c1a18]/10"></div>
              <span className="flex-shrink-0 mx-4 text-xs uppercase tracking-wider text-[#1c1a18]/50">
                {t("auth.common.or")}
              </span>
              <div className="flex-grow border-t border-[#1c1a18]/10"></div>
            </div>

            <GoogleOAuthButton className="mt-4" />
          </div>
        </form>
      )}
    </AnimatedAuthShell>
  );
}
