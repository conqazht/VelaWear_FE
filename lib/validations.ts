import { z } from "zod";

import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n";

const validationMessages = {
  en: {
    required: "Required",
    invalidEmail: "Enter a valid email address",
    passwordMin: "Use at least 8 characters",
    passwordMax: "Use no more than 100 characters",
    uppercase: "Include at least 1 uppercase letter",
    lowercase: "Include at least 1 lowercase letter",
    number: "Include at least 1 number",
    phoneRequired: "Phone number is required",
    invalidPhone: "Enter a valid Vietnamese phone number",
    fullNameRequired: "Full name is required",
    fullNameMin: "Full name must contain at least 2 characters",
    fullNameMax: "Full name must contain no more than 100 characters",
    nameRequired: "Name is required",
    nameMax: "Name must contain no more than 50 characters",
    birthDayRequired: "Birth day is required",
    birthMonthRequired: "Birth month is required",
    birthYearRequired: "Birth year is required",
    preferenceRequired: "Shopping preference is required",
    termsRequired: "You must agree to the Terms of Use",
    invalidBirthDate: "Enter a valid date of birth",
    otpRequired: "Verification code is required",
    otpLength: "Verification code must contain 6 digits",
    firstNameRequired: "First name is required",
    lastNameRequired: "Last name is required",
    addressRequired: "Street address is required",
    provinceRequired: "Select a province or city",
    wardRequired: "Select a ward or commune",
  },
  vi: {
    required: "Không được để trống",
    invalidEmail: "Vui lòng nhập địa chỉ email hợp lệ",
    passwordMin: "Mật khẩu phải có ít nhất 8 ký tự",
    passwordMax: "Mật khẩu không được vượt quá 100 ký tự",
    uppercase: "Mật khẩu cần ít nhất 1 chữ hoa",
    lowercase: "Mật khẩu cần ít nhất 1 chữ thường",
    number: "Mật khẩu cần ít nhất 1 chữ số",
    phoneRequired: "Số điện thoại không được để trống",
    invalidPhone: "Số điện thoại Việt Nam không hợp lệ",
    fullNameRequired: "Họ tên không được để trống",
    fullNameMin: "Họ tên phải có ít nhất 2 ký tự",
    fullNameMax: "Họ tên không được vượt quá 100 ký tự",
    nameRequired: "Tên không được để trống",
    nameMax: "Tên không được vượt quá 50 ký tự",
    birthDayRequired: "Ngày sinh không được để trống",
    birthMonthRequired: "Tháng sinh không được để trống",
    birthYearRequired: "Năm sinh không được để trống",
    preferenceRequired: "Sở thích mua sắm không được để trống",
    termsRequired: "Bạn phải đồng ý với Điều khoản sử dụng",
    invalidBirthDate: "Ngày tháng năm sinh không hợp lệ",
    otpRequired: "Mã xác nhận không được để trống",
    otpLength: "Mã xác nhận phải gồm 6 chữ số",
    firstNameRequired: "Tên không được để trống",
    lastNameRequired: "Họ không được để trống",
    addressRequired: "Địa chỉ không được để trống",
    provinceRequired: "Vui lòng chọn tỉnh/thành phố",
    wardRequired: "Vui lòng chọn phường/xã",
  },
} as const;

export function createEmailSchema(locale: Locale) {
  const copy = validationMessages[locale];
  return z.string({ message: copy.required }).min(1, copy.required).email(copy.invalidEmail);
}

export function createPasswordSchema(locale: Locale) {
  const copy = validationMessages[locale];
  return z
    .string({ message: copy.required })
    .min(1, copy.required)
    .min(8, copy.passwordMin)
    .max(100, copy.passwordMax);
}

export function createStrongPasswordSchema(locale: Locale) {
  const copy = validationMessages[locale];
  return createPasswordSchema(locale)
    .regex(/[A-Z]/, copy.uppercase)
    .regex(/[a-z]/, copy.lowercase)
    .regex(/[0-9]/, copy.number);
}

export function createPhoneSchema(locale: Locale) {
  const copy = validationMessages[locale];
  return z
    .string({ message: copy.phoneRequired })
    .regex(/^(0[3|5|7|8|9])+([0-9]{8})$/, copy.invalidPhone);
}

export function createFullNameSchema(locale: Locale) {
  const copy = validationMessages[locale];
  return z
    .string({ message: copy.fullNameRequired })
    .min(2, copy.fullNameMin)
    .max(100, copy.fullNameMax);
}

export function createNameSchema(locale: Locale) {
  const copy = validationMessages[locale];
  return z.string({ message: copy.nameRequired }).min(1, copy.nameRequired).max(50, copy.nameMax);
}

export const requiredStringSchema = (message: string) => z.string({ message }).min(1, message);

export function createSignInSchema(locale: Locale) {
  return z.object({
    email: createEmailSchema(locale),
    password: createPasswordSchema(locale),
  });
}

export function createSignUpSchema(locale: Locale) {
  const copy = validationMessages[locale];

  return z
    .object({
      email: createEmailSchema(locale),
      firstName: createNameSchema(locale),
      lastName: createNameSchema(locale),
      password: createStrongPasswordSchema(locale),
      dobDay: requiredStringSchema(copy.birthDayRequired),
      dobMonth: requiredStringSchema(copy.birthMonthRequired),
      dobYear: requiredStringSchema(copy.birthYearRequired),
      preference: requiredStringSchema(copy.preferenceRequired),
      termsConsent: z.literal(true, { message: copy.termsRequired }),
      emailConsent: z.boolean().optional(),
    })
    .refine(
      (data) => {
        const day = Number.parseInt(data.dobDay, 10);
        const month = Number.parseInt(data.dobMonth, 10);
        const year = Number.parseInt(data.dobYear, 10);
        if (Number.isNaN(day) || Number.isNaN(month) || Number.isNaN(year)) return false;

        const date = new Date(year, month - 1, day);
        return (
          date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
        );
      },
      { message: copy.invalidBirthDate, path: ["dobDay"] },
    );
}

export function createForgotPasswordRequestSchema(locale: Locale) {
  return z.object({ email: createEmailSchema(locale) });
}

export function createForgotPasswordResetSchema(locale: Locale) {
  const copy = validationMessages[locale];
  return z.object({
    otpCode: requiredStringSchema(copy.otpRequired).length(6, copy.otpLength),
    newPassword: createStrongPasswordSchema(locale),
  });
}

export function createProfileSettingsEmailSchema(locale: Locale) {
  return z.object({ email: createEmailSchema(locale) });
}

export function createCheckoutSchema(locale: Locale) {
  const copy = validationMessages[locale];
  return z.object({
    email: createEmailSchema(locale),
    phone: createPhoneSchema(locale),
    receiverName: createFullNameSchema(locale),
    address: requiredStringSchema(copy.addressRequired),
    provinceCode: requiredStringSchema(copy.provinceRequired),
    wardCode: requiredStringSchema(copy.wardRequired),
  });
}

// Backward-compatible Vietnamese defaults for non-reactive call sites.
export const emailSchema = createEmailSchema(DEFAULT_LOCALE);
export const passwordSchema = createPasswordSchema(DEFAULT_LOCALE);
export const strongPasswordSchema = createStrongPasswordSchema(DEFAULT_LOCALE);
export const phoneSchema = createPhoneSchema(DEFAULT_LOCALE);
export const fullNameSchema = createFullNameSchema(DEFAULT_LOCALE);
export const nameSchema = createNameSchema(DEFAULT_LOCALE);
export const signInSchema = createSignInSchema(DEFAULT_LOCALE);
export const signUpSchema = createSignUpSchema(DEFAULT_LOCALE);
export const forgotPasswordRequestSchema = createForgotPasswordRequestSchema(DEFAULT_LOCALE);
export const forgotPasswordResetSchema = createForgotPasswordResetSchema(DEFAULT_LOCALE);
export const profileSettingsEmailSchema = createProfileSettingsEmailSchema(DEFAULT_LOCALE);
export const checkoutSchema = createCheckoutSchema(DEFAULT_LOCALE);

/** Validates data and maps the first issue for each field. */
export function validateForm<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);
  if (result.success) return { success: true, data: result.data };

  const errors: Record<string, string> = {};
  result.error.issues.forEach((issue) => {
    const key = issue.path[0] as string;
    if (!errors[key]) errors[key] = issue.message;
  });

  return { success: false, errors };
}
