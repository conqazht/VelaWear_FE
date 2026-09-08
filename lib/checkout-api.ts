import apiClient from "./api-client";
import type { ApiResponse, PriceSource, Pricing } from "./api/types";

export type CheckoutPaymentMethod = "COD" | "SEPAY" | "VNPAY" | "MOMO" | "STRIPE";

export interface CheckoutRequest {
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  paymentMethod: CheckoutPaymentMethod;
  /** Chỉ giữ để tương thích API cũ. Backend luôn tự tính lại phí vận chuyển. */
  shippingFee?: number;
  couponCode?: string;
  pricingFingerprint?: string;
}

export interface CheckoutPreviewRequest {
  paymentMethod: CheckoutPaymentMethod;
  couponCode?: string;
}

export interface CheckoutItemResponse {
  orderItemId: number;
  variantId: number;
  productName: string;
  variantName?: string | null;
  sku: string;
  image?: string | null;
  listPrice: number;
  price: number;
  priceSource: PriceSource;
  saleCampaignItemId?: number | null;
  saleCampaignCode?: string | null;
  saleCampaignName?: string | null;
  quantity: number;
  subtotal: number;
}

export interface CheckoutPreviewItemResponse {
  variantId: number;
  productId: number;
  productName: string;
  sku: string;
  quantity: number;
  listPrice: number;
  price: number;
  subtotal: number;
  priceSource: PriceSource;
  saleCampaignItemId?: number | null;
  saleCampaignCode?: string | null;
  saleCampaignName?: string | null;
  pricing: Pricing;
  couponEligible: boolean;
}

export interface CheckoutPreviewResponse {
  serverTime: string;
  pricingFingerprint: string;
  subtotal: number;
  couponEligibleSubtotal: number;
  shippingFee: number;
  discountAmount: number;
  finalAmount: number;
  items: CheckoutPreviewItemResponse[];
  warnings?: string[];
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
  paymentDueAt?: string | null;
  reservationExpiresAt?: string | null;
  serverTime?: string | null;
  createdAt: string;
}

interface ApiEnvelope<T = unknown> {
  statusCode: number;
  data: T | null;
  message: string;
  code?: string;
  error?: string;
  timestamp?: string;
}

export type CheckoutErrorKind =
  | "validation"
  | "insufficient_stock"
  | "flash_sold_out"
  | "flash_ended"
  | "customer_limit"
  | "price_changed"
  | "invalid_coupon"
  | "unauthenticated"
  | "idempotency_conflict"
  | "conflict"
  | "unknown";

export interface CheckoutError {
  kind: CheckoutErrorKind;
  code?: string;
  status?: number;
  message: string;
  fieldErrors?: Record<string, string>;
}

const ERROR_KIND_BY_CODE: Record<string, CheckoutErrorKind> = {
  INSUFFICIENT_STOCK: "insufficient_stock",
  FLASH_SALE_SOLD_OUT: "flash_sold_out",
  FLASH_SALE_ENDED: "flash_ended",
  FLASH_SALE_LIMIT_EXCEEDED: "customer_limit",
  PRICE_CHANGED: "price_changed",
  IDEMPOTENCY_KEY_REUSED: "idempotency_conflict",
  INVALID_COUPON: "invalid_coupon",
  COUPON_INVALID: "invalid_coupon",
  COUPON_EXPIRED: "invalid_coupon",
  COUPON_USAGE_LIMIT_EXCEEDED: "invalid_coupon",
  COUPON_NOT_APPLICABLE: "invalid_coupon",
};

const DEFAULT_MESSAGE_BY_KIND: Record<CheckoutErrorKind, string> = {
  validation: "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.",
  insufficient_stock: "Số lượng tồn kho vừa thay đổi. Giỏ hàng đã được cập nhật.",
  flash_sold_out: "Suất Flash Sale vừa hết. Giỏ hàng đã được cập nhật theo dữ liệu mới nhất.",
  flash_ended: "Chương trình Flash Sale đã kết thúc. Vui lòng kiểm tra lại giá mới.",
  customer_limit: "Bạn đã vượt giới hạn mua của sản phẩm Flash Sale này.",
  price_changed: "Giá sản phẩm vừa thay đổi. Vui lòng kiểm tra lại tổng tiền trước khi đặt hàng.",
  invalid_coupon: "Mã giảm giá không hợp lệ hoặc không còn đủ điều kiện áp dụng.",
  unauthenticated: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
  idempotency_conflict: "Yêu cầu đặt hàng này không còn khớp với lần gửi trước. Vui lòng thử lại.",
  conflict: "Dữ liệu đơn hàng vừa thay đổi. Vui lòng kiểm tra lại.",
  unknown: "Có lỗi xảy ra trong quá trình đặt hàng. Vui lòng thử lại.",
};

/** Ưu tiên mã lỗi ổn định; dò message chỉ là tương thích với backend cũ. */
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
  const code = responseData?.code?.toUpperCase();
  const serverMessage = responseData?.message?.trim();

  if (status === 401) {
    return {
      kind: "unauthenticated",
      code,
      status,
      message: serverMessage || DEFAULT_MESSAGE_BY_KIND.unauthenticated,
    };
  }

  const codedKind = code ? ERROR_KIND_BY_CODE[code] : undefined;
  if (codedKind) {
    return {
      kind: codedKind,
      code,
      status,
      message: serverMessage || DEFAULT_MESSAGE_BY_KIND[codedKind],
    };
  }

  if (status === 400) {
    const normalized = (serverMessage ?? "").toLowerCase();
    if (normalized.includes("coupon") || normalized.includes("mã giảm giá")) {
      return {
        kind: "invalid_coupon",
        code,
        status,
        message: serverMessage || DEFAULT_MESSAGE_BY_KIND.invalid_coupon,
      };
    }

    const fieldErrors =
      responseData?.data && typeof responseData.data === "object"
        ? (responseData.data as Record<string, string>)
        : undefined;
    return {
      kind: "validation",
      code,
      status,
      message: serverMessage || DEFAULT_MESSAGE_BY_KIND.validation,
      fieldErrors,
    };
  }

  if (status === 409) {
    const normalized = (serverMessage ?? "").toLowerCase();
    const kind: CheckoutErrorKind =
      normalized.includes("stock") || normalized.includes("tồn kho")
        ? "insufficient_stock"
        : normalized.includes("coupon") || normalized.includes("mã giảm giá")
          ? "invalid_coupon"
          : "conflict";
    return {
      kind,
      code,
      status,
      message: serverMessage || DEFAULT_MESSAGE_BY_KIND[kind],
    };
  }

  return {
    kind: "unknown",
    code,
    status,
    message: serverMessage || apiError.message || DEFAULT_MESSAGE_BY_KIND.unknown,
  };
}

function normalizeItem<T extends CheckoutItemResponse | CheckoutPreviewItemResponse>(item: T): T {
  return {
    ...item,
    listPrice: Number(item.listPrice ?? item.price),
    price: Number(item.price),
    quantity: Number(item.quantity),
    subtotal: Number(item.subtotal),
  } as T;
}

function normalizePreview(data: CheckoutPreviewResponse): CheckoutPreviewResponse {
  return {
    ...data,
    subtotal: Number(data.subtotal),
    couponEligibleSubtotal: Number(data.couponEligibleSubtotal),
    shippingFee: Number(data.shippingFee),
    discountAmount: Number(data.discountAmount),
    finalAmount: Number(data.finalAmount),
    items: (data.items ?? []).map(normalizeItem),
  };
}

export async function previewCheckout(
  request: CheckoutPreviewRequest,
): Promise<CheckoutPreviewResponse> {
  const response = await apiClient.post<ApiResponse<CheckoutPreviewResponse>>(
    "/checkout/preview",
    request,
  );
  if (!response.data.data) {
    throw new Error("Unexpected empty checkout preview response.");
  }
  return normalizePreview(response.data.data);
}

export async function submitCheckout(
  request: CheckoutRequest,
  idempotencyKey: string,
): Promise<CheckoutResponse> {
  const response = await apiClient.post<ApiResponse<CheckoutResponse>>("/checkout", request, {
    headers: { "Idempotency-Key": idempotencyKey },
  });

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
    items: (data.items ?? []).map(normalizeItem),
  };
}

export async function cancelOrder(orderId: number): Promise<void> {
  await apiClient.post(`/checkout/${orderId}/cancel`);
}
