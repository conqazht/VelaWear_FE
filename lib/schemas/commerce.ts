import { z } from "zod";

export const checkoutSchema = z.object({
  receiverName: z.string().min(2, "Vui lòng nhập tên người nhận."),
  receiverPhone: z.string().min(8, "Số điện thoại không hợp lệ."),
  receiverAddress: z.string().min(8, "Vui lòng nhập địa chỉ giao hàng."),
  paymentMethod: z.enum(["COD", "VNPAY", "MOMO", "BANK_TRANSFER"]),
  shippingFee: z.number().nonnegative(),
  couponCode: z.string().optional(),
});

export const userAddressSchema = z.object({
  userId: z.number(),
  receiverName: z.string().min(2, "Vui lòng nhập tên người nhận."),
  receiverPhone: z.string().min(8, "Số điện thoại không hợp lệ."),
  addressLine: z.string().min(8, "Vui lòng nhập địa chỉ."),
  isDefault: z.boolean().optional(),
});

export const reviewSchema = z.object({
  userId: z.number(),
  orderItemId: z.number(),
  rating: z.number().min(1).max(5),
  content: z.string().max(1000).optional(),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
export type UserAddressFormValues = z.infer<typeof userAddressSchema>;
export type ReviewFormValues = z.infer<typeof reviewSchema>;
