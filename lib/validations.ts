import { z } from "zod";

// Base rules
export const emailSchema = z
  .string({ message: "Required" })
  .min(1, "Required")
  .email("Invalid Email");

export const passwordSchema = z
  .string({ message: "Required" })
  .min(1, "Required")
  .min(8, "Minimum 8 characters")
  .max(100, "Maximum 100 characters");

export const strongPasswordSchema = passwordSchema
  .regex(/[A-Z]/, "Requires 1 uppercase letter")
  .regex(/[a-z]/, "Requires 1 lowercase letter")
  .regex(/[0-9]/, "Requires 1 number");

export const phoneSchema = z
  .string({ message: "Số điện thoại không được để trống" })
  .regex(/^(0[3|5|7|8|9])+([0-9]{8})$/, "Số điện thoại không hợp lệ");

export const fullNameSchema = z
  .string({ message: "Họ tên không được để trống" })
  .min(2, "Họ tên phải có ít nhất 2 ký tự")
  .max(100, "Họ tên không được vượt quá 100 ký tự");

export const nameSchema = z
  .string({ message: "Tên không được để trống" })
  .min(1, "Tên không được để trống")
  .max(50, "Tên không được vượt quá 50 ký tự");

export const requiredStringSchema = (message: string) =>
  z.string({ message: message }).min(1, message);

// Form Schemas
export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signUpSchema = z.object({
  email: emailSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  password: strongPasswordSchema,
  dobDay: requiredStringSchema("Ngày sinh không được để trống"),
  dobMonth: requiredStringSchema("Tháng sinh không được để trống"),
  dobYear: requiredStringSchema("Năm sinh không được để trống"),
  preference: requiredStringSchema("Sở thích mua sắm không được để trống"),
  termsConsent: z.literal(true, {
    message: "Bạn phải đồng ý với Điều khoản sử dụng",
  }),
  emailConsent: z.boolean().optional(),
}).refine(
  (data) => {
    // Validate valid date
    const day = parseInt(data.dobDay, 10);
    const month = parseInt(data.dobMonth, 10);
    const year = parseInt(data.dobYear, 10);
    if (isNaN(day) || isNaN(month) || isNaN(year)) return false;
    
    const date = new Date(year, month - 1, day);
    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  },
  {
    message: "Ngày tháng năm sinh không hợp lệ",
    path: ["dobDay"], // Error will be attached to dobDay
  }
);

export const forgotPasswordRequestSchema = z.object({
  email: emailSchema,
});

export const forgotPasswordResetSchema = z.object({
  otpCode: requiredStringSchema("Mã xác nhận không được để trống").length(6, "Mã xác nhận phải gồm 6 chữ số"),
  newPassword: strongPasswordSchema,
});

export const profileSettingsEmailSchema = z.object({
  email: emailSchema,
});

export const checkoutSchema = z.object({
  email: emailSchema,
  phone: phoneSchema,
  firstName: requiredStringSchema("Tên không được để trống"),
  lastName: requiredStringSchema("Họ không được để trống"),
  address: requiredStringSchema("Địa chỉ không được để trống"),
  city: requiredStringSchema("Thành phố không được để trống"),
  zipCode: requiredStringSchema("Mã bưu chính không được để trống"),
});

/**
 * Utility function to validate data using a Zod schema and format errors
 * into a Record<string, string> mapped to form fields.
 */
export function validateForm<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  result.error.issues.forEach((issue) => {
    const key = issue.path[0] as string;
    if (!errors[key]) {
      errors[key] = issue.message;
    }
  });

  return { success: false, errors };
}
