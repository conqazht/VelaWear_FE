import apiClient from "./api-client";
import type { ApiResponse } from "./api/types";

// ---------------------------------------------------------------------------
// Request types
// ---------------------------------------------------------------------------

export interface CheckoutRequest {
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  paymentMethod: "COD" | "VNPAY" | "MOMO" | "BANK_TRANSFER";
  shippingFee: number;
  couponCode?: string;
}

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

export interface CheckoutItemResponse {
  orderItemId: number;
  variantId: number;
  productName: string;
  variantName: string | null;
  sku: string;
  image: string | null;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface PaymentInitiationResponse {
  provider: string;
  method: string;
  actionUrl: string;
  fields: Record<string, string>;
}

export interface CheckoutResponse {
  orderId: number;
  orderCode: string;
  status: string;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  finalAmount: number;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  paymentMethod: string;
  paymentStatus: string;
  items: CheckoutItemResponse[];
  paymentId: number | null;
  paymentInitiation: PaymentInitiationResponse | null;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Standard API envelope
// ---------------------------------------------------------------------------

interface ApiEnvelope<T = unknown> {
  statusCode: number;
  data: T | null;
  message: string;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Error types
// ---------------------------------------------------------------------------

export type CheckoutErrorKind =
  | "validation"
  | "insufficient_stock"
  | "invalid_coupon"
  | "unauthenticated"
  | "conflict"
  | "unknown";

export interface CheckoutError {
  kind: CheckoutErrorKind;
  message: string;
  fieldErrors?: Record<string, string>;
}

/**
 * Extract a user-friendly error from a checkout API failure.
 */
export function extractCheckoutError(error: unknown): CheckoutError {
  const apiError = error as {
    response?: {
      status?: number;
      data?: ApiEnvelope<Record<string, string> | null>;
    };
    message?: string;
  };

  const status = apiError.response?.status;
  const responseData = apiError.response?.data;
  const serverMessage = responseData?.message ?? "";

  if (status === 401) {
    return {
      kind: "unauthenticated",
      message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
    };
  }

  if (status === 400) {
    const normalized = serverMessage.toLowerCase();

    if (normalized.includes("coupon") || normalized.includes("mã giảm giá")) {
      return {
        kind: "invalid_coupon",
        message: serverMessage || "Mã giảm giá không hợp lệ.",
      };
    }

    // Validation field-level errors come in `data` as { fieldName: message }
    const fieldErrors =
      responseData?.data && typeof responseData.data === "object"
        ? (responseData.data as Record<string, string>)
        : undefined;

    return {
      kind: "validation",
      message: serverMessage || "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.",
      fieldErrors,
    };
  }

  if (status === 409) {
    const normalized = serverMessage.toLowerCase();

    if (normalized.includes("stock") || normalized.includes("tồn kho")) {
      return {
        kind: "insufficient_stock",
        message:
          serverMessage ||
          "Một số sản phẩm trong giỏ hàng đã hết hàng hoặc không đủ số lượng.",
      };
    }

    if (normalized.includes("coupon") || normalized.includes("mã giảm giá")) {
      return {
        kind: "invalid_coupon",
        message: serverMessage || "Mã giảm giá đã hết lượt sử dụng.",
      };
    }

    return {
      kind: "conflict",
      message: serverMessage || "Đã xảy ra xung đột khi xử lý đơn hàng.",
    };
  }

  return {
    kind: "unknown",
    message:
      serverMessage ||
      apiError.message ||
      "Có lỗi xảy ra trong quá trình đặt hàng. Vui lòng thử lại.",
  };
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

/**
 * Submit a checkout order. Returns the created order details.
 */
export async function submitCheckout(
  request: CheckoutRequest
): Promise<CheckoutResponse> {
  const response = await apiClient.post<ApiResponse<CheckoutResponse>>("/checkout", request);

  const data = response.data.data;
  if (!data) {
    throw new Error("Unexpected empty response from checkout API.");
  }

  return {
    ...data,
    subtotal: Number(data.subtotal),
    shippingFee: Number(data.shippingFee),
    discountAmount: Number(data.discountAmount),
    finalAmount: Number(data.finalAmount),
    items: data.items.map((item) => ({
      ...item,
      price: Number(item.price),
      subtotal: Number(item.subtotal),
    })),
  };
}

/**
 * Cancel a pending order by ID.
 */
export async function cancelOrder(orderId: number): Promise<void> {
  await apiClient.put(`/orders/${orderId}`, { status: "CANCELLED" });
}
