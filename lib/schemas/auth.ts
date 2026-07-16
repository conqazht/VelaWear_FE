import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Email không hợp lệ."),
  password: z.string().min(1, "Vui lòng nhập mật khẩu."),
});

export const registerSchema = z.object({
  email: z.email("Email không hợp lệ."),
  password: z.string().min(8, "Mật khẩu cần ít nhất 8 ký tự."),
  fullName: z.string().min(2, "Vui lòng nhập họ tên."),
  birthDate: z.string().optional().nullable(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional().nullable(),
  otpProofToken: z.string().min(1, "Thiếu proof token xác minh email."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
