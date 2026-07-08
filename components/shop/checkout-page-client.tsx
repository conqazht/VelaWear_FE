"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { useState, useEffect } from "react";
import {
  CheckCircle2,
  LockKeyhole,
  Loader2,
  AlertTriangle,
  Truck,
  ShoppingBag,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { FashionImage } from "@/components/shop/fashion-image";
import { FieldLabel } from "@/components/shop/field-label";
import { useCart } from "@/components/shop/cart-provider";
import { money } from "@/lib/vela-data";
import { useAuth } from "@/components/auth/auth-provider";
import {
  submitCheckout,
  extractCheckoutError,
  type CheckoutRequest,
  type CheckoutResponse,
} from "@/lib/checkout-api";
import { checkoutSchema } from "@/lib/validations";

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

// ---------------------------------------------------------------------------
// Payment method options
// ---------------------------------------------------------------------------

const PAYMENT_METHODS = [
  { value: "COD" as const, label: "Thanh toán khi nhận hàng (COD)", disabled: false },
  { value: "BANK_TRANSFER" as const, label: "Chuyển khoản ngân hàng", disabled: false },
  { value: "VNPAY" as const, label: "VNPay (Sắp ra mắt)", disabled: true },
  { value: "MOMO" as const, label: "MoMo (Sắp ra mắt)", disabled: true },
] as const;

type PaymentMethodValue = (typeof PAYMENT_METHODS)[number]["value"];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CheckoutPageClient() {
  const { cart, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [couponCode, setCouponCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodValue>("COD");
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<CheckoutResponse | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema as never),
    defaultValues: {
      email: "",
      phone: "",
      firstName: "",
      lastName: "",
      address: "",
      city: "",
      zipCode: "",
    },
  });

  // Pre-populate fields when user context is available
  useEffect(() => {
    if (user) {
      setValue("email", user.email);
      const names = user.fullName.split(" ");
      setValue("firstName", names[0] || "");
      setValue("lastName", names.slice(1).join(" ") || "");
    }
  }, [user, setValue]);

  const activeItemsList = cart;

  // Client-side estimates for display only — server is authoritative
  const subtotal = activeItemsList.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shippingFee = subtotal >= 500000 ? 0 : 30000;
  const estimatedTotal = subtotal + shippingFee;

  const onCompletePurchase = async (data: CheckoutFormValues) => {
    setApiError(null);
    setCouponError(null);

    try {
      const request: CheckoutRequest = {
        userId: user?.id as number,
        receiverName: `${data.firstName} ${data.lastName}`.trim(),
        receiverPhone: data.phone,
        receiverAddress: [data.address, data.city, data.zipCode].filter(Boolean).join(", "),
        paymentMethod,
        subtotal,
        shippingFee,
        discountAmount: 0,
        finalAmount: estimatedTotal,
        couponCode: couponCode.trim() || undefined,
      };

      const response = await submitCheckout(request);
      setCompletedOrder(response);
      setOrderCompleted(true);
      clearCart();
    } catch (err: unknown) {
      const checkoutErr = extractCheckoutError(err);

      if (checkoutErr.kind === "invalid_coupon") {
        setCouponError(checkoutErr.message);
      } else {
        setApiError(checkoutErr.message);
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="mx-auto w-full max-w-[1800px] px-6 py-24 min-h-[70vh] flex flex-col justify-center items-center">
        <Card className="mx-auto flex max-w-md flex-col items-center rounded-md border-[#1c1a18]/5 bg-white p-8 py-10 text-center shadow-lg">
          <LockKeyhole className="mb-6 size-12 text-[#b85a3c]" />
          <h2 className="mb-4 font-serif text-2xl font-light text-[#1c1a18]">
            Đăng nhập để thanh toán
          </h2>
          <p className="mb-8 text-xs leading-relaxed text-[#1c1a18]/65">
            Bạn cần đăng nhập tài khoản Vela Member để tiến hành đặt hàng và nhận các ưu đãi thành viên.
          </p>
          <Link
            href="/sign-in"
            className="inline-flex w-full justify-center rounded-sm bg-[#1c1a18] px-8 py-3.5 text-xs font-bold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#b85a3c]"
          >
            Đăng nhập ngay
          </Link>
        </Card>
      </div>
    );
  }

  if (orderCompleted && completedOrder) {
    return (
      <div className="mx-auto w-full max-w-[1800px] px-6 pt-[104px] pb-12 md:px-16 md:pt-[120px] min-h-[80vh] flex flex-col justify-center items-center">
        <Card className="mx-auto mt-6 flex max-w-lg flex-col items-center rounded-md border-[#1c1a18]/5 bg-white p-12 py-12 text-center shadow-xl">
          <CheckCircle2 className="mb-6 size-14 text-[#b85a3c]" />
          <h1 className="mb-4 font-serif text-3xl font-light text-[#1c1a18]">
            Đặt hàng thành công!
          </h1>
          <p className="mb-2 text-sm leading-relaxed text-[#1c1a18]/65">
            Cám ơn bạn đã lựa chọn tin dùng thời trang tối giản của{" "}
            <strong>VELA WEAR</strong>.
          </p>
          <p className="mb-2 text-xs font-semibold text-[#1c1a18]/50">
            Mã đơn hàng của bạn:{" "}
            <span className="font-serif text-sm tracking-wide text-black">
              {completedOrder.orderCode}
            </span>
          </p>
          <div className="mb-4 flex flex-wrap justify-center gap-x-6 gap-y-1 text-[10px] uppercase tracking-widest text-[#1c1a18]/45">
            <span>
              Tổng:{" "}
              <strong className="text-[#1c1a18]">
                {money(completedOrder.finalAmount)}
              </strong>
            </span>
            <span>
              Thanh toán:{" "}
              <strong className="text-[#1c1a18]">
                {completedOrder.paymentMethod === "COD"
                  ? "COD"
                  : completedOrder.paymentMethod}
              </strong>
            </span>
            <span>
              Trạng thái:{" "}
              <strong className="text-[#1c1a18]">
                {completedOrder.status}
              </strong>
            </span>
          </div>
          <div className="mb-6 h-px w-12 bg-[#1c1a18]/10" />
          <p className="mb-10 max-w-sm text-xs font-light leading-relaxed text-[#1c1a18]/60">
            Thông tin giao nhận sẽ được cập nhật qua email{" "}
            <strong>{completedOrder.receiverName}</strong>.
          </p>
          <Link
            href="/"
            className="inline-flex w-full justify-center rounded-sm bg-[#1c1a18] px-8 py-3.5 text-xs font-bold uppercase tracking-[0.15em] text-white shadow-md transition-colors hover:bg-[#b85a3c]"
          >
            Quay lại trang chủ VELA WEAR
          </Link>
        </Card>
      </div>
    );
  }

  if (activeItemsList.length === 0) {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-[1800px] items-center justify-center px-6 py-24">
        <Card className="mx-auto flex max-w-md flex-col items-center rounded-md border-[#1c1a18]/5 bg-white p-8 py-10 text-center shadow-lg">
          <ShoppingBag className="mb-6 size-12 text-[#b85a3c]" />
          <h2 className="mb-4 font-serif text-2xl font-light text-[#1c1a18]">
            Giỏ hàng đang trống
          </h2>
          <p className="mb-8 text-xs leading-relaxed text-[#1c1a18]/65">
            Thêm sản phẩm vào giỏ hàng trước khi tiến hành thanh toán.
          </p>
          <Link
            href="/collection"
            className="inline-flex w-full justify-center rounded-sm bg-[#1c1a18] px-8 py-3.5 text-xs font-bold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#b85a3c]"
          >
            Tiếp tục mua sắm
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1800px] px-6 pt-[104px] pb-12 md:px-16 md:pt-[120px]">
      <div className="mb-8 flex justify-between gap-4">
        <h1 className="font-serif text-3xl font-light tracking-wide text-[#1c1a18] md:text-4xl">
          Checkout
        </h1>
        <Link
          href="/cart"
          className="text-xs font-semibold uppercase tracking-wider text-[#b85a3c] hover:underline"
        >
          ← View Cart
        </Link>
      </div>

      <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
        <form onSubmit={handleSubmit(onCompletePurchase)} className="space-y-10 lg:col-span-7">
          {apiError && (
            <div className="flex items-start gap-3 rounded border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-700">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

          <Card className="space-y-5 rounded-md border-[#1c1a18]/5 bg-white p-8 py-8">
            <SectionTitle number="1" title="Contact Information" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <CheckoutInput
                label="Email Address *"
                type="email"
                autoComplete="email"
                placeholder="address@domain.com"
                {...register("email")}
                error={errors.email?.message}
              />
              <CheckoutInput
                label="Phone Number *"
                type="tel"
                autoComplete="tel"
                placeholder="09xxx xxxxx"
                {...register("phone")}
                error={errors.phone?.message}
              />
            </div>
          </Card>

          <Card className="space-y-5 rounded-md border-[#1c1a18]/5 bg-white p-8 py-8">
            <SectionTitle number="2" title="Shipping Address" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <CheckoutInput
                label="First Name *"
                autoComplete="given-name"
                placeholder="Jon"
                {...register("firstName")}
                error={errors.firstName?.message}
              />
              <CheckoutInput
                label="Last Name *"
                autoComplete="family-name"
                placeholder="Doe"
                {...register("lastName")}
                error={errors.lastName?.message}
              />
            </div>
            <CheckoutInput
              label="Street Address *"
              autoComplete="street-address"
              placeholder="Nguyễn Huệ, Quận 1, Tp.HCM"
              {...register("address")}
              error={errors.address?.message}
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <CheckoutInput
                label="City *"
                autoComplete="address-level2"
                placeholder="Ho Chi Minh City"
                {...register("city")}
                error={errors.city?.message}
              />
              <CheckoutInput
                label="State / Province"
                autoComplete="address-level1"
                placeholder="Sông Bé"
              />
              <CheckoutInput
                label="ZIP / Postal Code *"
                autoComplete="postal-code"
                placeholder="70000"
                {...register("zipCode")}
                error={errors.zipCode?.message}
              />
            </div>
          </Card>

          <Card className="space-y-5 rounded-md border-[#1c1a18]/5 bg-white p-8 py-8">
            <SectionTitle number="3" title="Payment Method" />
            <div className="space-y-3">
              {PAYMENT_METHODS.map((method) => (
                <label
                  key={method.value}
                  className={`flex cursor-pointer items-center gap-3 rounded-sm border p-4 transition-colors ${
                    method.disabled
                      ? "cursor-not-allowed border-[#1c1a18]/5 bg-[#f7f4ef]/20 opacity-50"
                      : paymentMethod === method.value
                        ? "border-[#b85a3c] bg-[#b85a3c]/5"
                        : "border-[#1c1a18]/10 bg-white hover:border-[#1c1a18]/25"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.value}
                    checked={paymentMethod === method.value}
                    onChange={() => setPaymentMethod(method.value)}
                    disabled={method.disabled}
                    className="size-4 accent-[#b85a3c]"
                  />
                  <span className="flex items-center gap-2 text-sm text-[#1c1a18]">
                    {method.value === "COD" && (
                      <Truck className="size-4 text-[#1c1a18]/50" />
                    )}
                    {method.label}
                  </span>
                </label>
              ))}
            </div>
          </Card>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-auto w-full rounded-sm bg-[#1c1a18] py-[1.125rem] text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-md hover:bg-[#b85a3c] disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Đang xử lý đặt hàng...
              </>
            ) : (
              <>
                <LockKeyhole className="size-4" />
                Hoàn tất đặt hàng
              </>
            )}
          </Button>
        </form>

        <Card className="sticky top-24 rounded-md border-[#1c1a18]/5 bg-white p-8 py-8 shadow-sm lg:col-span-5">
          <h2 className="mb-6 font-serif text-xl font-light tracking-wide text-[#1c1a18]">
            Your Order Summary
          </h2>
          <div className="no-scrollbar mb-8 max-h-[280px] space-y-4 overflow-y-auto pr-1">
            {activeItemsList.map((item) => (
              <div key={`${item.id}-${item.size}`} className="flex items-center gap-4">
                <div className="relative h-18 w-14 shrink-0 overflow-hidden rounded-none border border-[#1c1a18]/5 bg-[#efebe4]">
                  <FashionImage src={item.image} alt={item.name} />
                </div>
                <div className="min-w-0 flex-grow text-xs">
                  <h4 className="truncate font-serif font-semibold text-[#1c1a18]">
                    {item.name}
                  </h4>
                  <p className="mt-1 truncate text-[9px] uppercase tracking-widest text-[#1c1a18]/50">
                    Qty {item.quantity} / {item.size || "M"} / {item.color || "Oat"}
                  </p>
                </div>
                <span className="font-serif text-xs font-semibold text-[#1c1a18]">
                  {money(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="mb-8">
            <div className="flex gap-2">
              <Input
                value={couponCode}
                onChange={(event) => {
                  setCouponCode(event.target.value);
                  if (couponError) setCouponError(null);
                }}
                autoComplete="off"
                placeholder="Nhập mã giảm giá"
                className="h-10 rounded-sm border-[#1c1a18]/15 bg-[#f7f4ef]/30 px-3 text-xs font-semibold uppercase tracking-wider focus-visible:border-[#b85a3c] focus-visible:ring-[#b85a3c]/20"
              />
              <Button
                type="button"
                onClick={() => {
                  if (couponCode.trim()) {
                    setCouponError(null);
                  }
                }}
                className="h-10 shrink-0 rounded-sm bg-[#1c1a18] px-4 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-[#b85a3c]"
              >
                Apply
              </Button>
            </div>
            {couponError && (
              <p className="mt-2 text-xs text-red-600">{couponError}</p>
            )}
            {couponCode.trim() && !couponError && (
              <p className="mt-2 text-xs text-[#1c1a18]/50">
                Mã &ldquo;{couponCode.trim().toUpperCase()}&rdquo; sẽ được áp dụng khi đặt hàng.
              </p>
            )}
          </div>

          <div className="space-y-4 border-t border-[#1c1a18]/5 pt-6 text-xs tracking-wide">
            <LedgerRow label="Subtotal" value={money(subtotal)} />
            <LedgerRow
              label="Shipping"
              value={shippingFee === 0 ? "Complimentary" : money(shippingFee)}
            />
            {couponCode.trim() && (
              <LedgerRow
                label="Coupon"
                value={couponCode.trim().toUpperCase()}
                highlight
              />
            )}
            <Separator className="my-4 bg-[#1c1a18]/10" />
            <div className="flex justify-between font-semibold text-[#1c1a18] md:text-base">
              <span>Estimated Total</span>
              <span className="font-serif text-lg tracking-wider text-[#b85a3c]">
                {money(estimatedTotal)}
              </span>
            </div>
            <p className="text-[10px] leading-relaxed text-[#1c1a18]/40">
              Giảm giá (nếu có) sẽ được áp dụng sau khi xác nhận mã coupon bởi hệ thống.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

function SectionTitle({ number, title }: { number: string; title: string }) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <span className="flex size-5 items-center justify-center rounded-full bg-[#1c1a18] text-[11px] font-semibold text-white">
        {number}
      </span>
      <h2 className="font-serif text-lg font-medium tracking-wide text-[#1c1a18]">
        {title}
      </h2>
    </div>
  );
}

function CheckoutInput({
  label,
  error,
  ...props
}: ComponentProps<typeof Input> & {
  label: string;
  error?: string;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <Input
        {...props}
        className="h-12 rounded-sm border-[#1c1a18]/15 bg-[#f7f4ef]/30 px-4 text-sm focus-visible:border-[#b85a3c] focus-visible:ring-[#b85a3c]/20"
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function LedgerRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={
        highlight
          ? "flex justify-between text-[#b85a3c]"
          : "flex justify-between text-[#1c1a18]/65"
      }
    >
      <span>{label}</span>
      <span className="font-semibold text-[#1c1a18]">{value}</span>
    </div>
  );
}
