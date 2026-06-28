"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { useMemo, useState, useEffect } from "react";
import { CheckCircle2, CreditCard, LockKeyhole } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { FashionImage } from "@/components/shop/fashion-image";
import { FieldLabel } from "@/components/shop/field-label";
import { useCart } from "@/components/shop/cart-provider";
import { CartItem, CHECKOUT_DEFAULT_ITEMS, money } from "@/lib/vela-data";
import { useAuth } from "@/components/auth/auth-provider";
import apiClient from "@/lib/api-client";

export function CheckoutPageClient() {
  const { cart, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardName, setCardName] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-populate fields when user context is available
  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEmail(user.email);
      const names = user.fullName.split(" ");
      setFirstName(names[0] || "");
      setLastName(names.slice(1).join(" ") || "");
    }
  }, [user]);

  const activeItemsList: CartItem[] = useMemo(
    () =>
      cart.length > 0
        ? cart
        : CHECKOUT_DEFAULT_ITEMS.map((item) => ({ ...item, quantity: 1 })),
    [cart]
  );

  const subtotal = activeItemsList.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discountAmount = discountApplied ? subtotal * 0.15 : 0;
  const shipping = subtotal >= 400 ? 0 : 15;
  const taxes = (subtotal - discountAmount) * 0.08;
  const total = subtotal - discountAmount + shipping + taxes;

  const handleApplyCoupon = (event: React.FormEvent) => {
    event.preventDefault();
    setDiscountApplied(
      couponCode.toUpperCase() === "VELA15" ||
        couponCode.toLowerCase() === "autumn"
    );
  };

  const handleCompletePurchase = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email || !firstName || !address || !cardNumber || !phone) {
      setError("Please fill out all required fields.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const orderCode = `VELA-${Math.floor(100000 + Math.random() * 900000)}`;
      const payload = {
        userId: user ? user.id : null,
        orderCode,
        subtotal: parseFloat(total.toFixed(2)),
        receiverName: `${firstName} ${lastName}`.trim(),
        receiverPhone: phone,
        receiverAddress: `${address}, ${city}, ZIP: ${zipCode}`,
        paymentMethod: "CASH", // Defaulting to Cash payment method
      };

      await apiClient.post("/orders", payload);
      setOrderId(orderCode);
      setOrderCompleted(true);
      clearCart();
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      if (apiError.response?.data?.message) {
        setError(apiError.response.data.message);
      } else {
        setError("Có lỗi xảy ra trong quá trình đặt hàng. Vui lòng thử lại.");
      }
    } finally {
      setIsSubmitting(false);
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

  if (orderCompleted) {
    return (
      <div className="mx-auto w-full max-w-[1800px] px-6 py-12 md:px-16 min-h-[80vh] flex flex-col justify-center items-center">
        <Card className="mx-auto mt-6 flex max-w-lg flex-col items-center rounded-md border-[#1c1a18]/5 bg-white p-12 py-12 text-center shadow-xl">
          <CheckCircle2 className="mb-6 size-14 text-[#b85a3c]" />
          <h1 className="mb-4 font-serif text-3xl font-light text-[#1c1a18]">
            Đặt hàng thành công!
          </h1>
          <p className="mb-2 text-sm leading-relaxed text-[#1c1a18]/65">
            Cám ơn bạn đã lựa chọn tin dùng thời trang tối giản của{" "}
            <strong>VELA WEAR</strong>.
          </p>
          <p className="mb-6 text-xs font-semibold text-[#1c1a18]/50">
            Mã đơn hàng của bạn:{" "}
            <span className="font-serif text-sm tracking-wide text-black">
              {orderId}
            </span>
          </p>
          <div className="mb-6 h-px w-12 bg-[#1c1a18]/10" />
          <p className="mb-10 max-w-sm text-xs font-light leading-relaxed text-[#1c1a18]/60">
            Thông tin giao nhận sẽ được cập nhật qua email{" "}
            <strong>{email}</strong>.
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

  return (
    <div className="mx-auto w-full max-w-[1800px] px-6 py-12 md:px-16">
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
        <form onSubmit={handleCompletePurchase} className="space-y-10 lg:col-span-7">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-700 text-sm rounded">
              {error}
            </div>
          )}

          <Card className="space-y-5 rounded-md border-[#1c1a18]/5 bg-white p-8 py-8">
            <SectionTitle number="1" title="Contact Information" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <CheckoutInput
                label="Email Address *"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={setEmail}
                placeholder="address@domain.com"
              />
              <CheckoutInput
                label="Phone Number *"
                type="tel"
                required
                autoComplete="tel"
                value={phone}
                onChange={setPhone}
                placeholder="09xxx xxxxx"
              />
            </div>
          </Card>

          <Card className="space-y-5 rounded-md border-[#1c1a18]/5 bg-white p-8 py-8">
            <SectionTitle number="2" title="Shipping Address" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <CheckoutInput
                label="First Name *"
                required
                autoComplete="given-name"
                value={firstName}
                onChange={setFirstName}
                placeholder="Jon"
              />
              <CheckoutInput
                label="Last Name *"
                required
                autoComplete="family-name"
                value={lastName}
                onChange={setLastName}
                placeholder="Doe"
              />
            </div>
            <CheckoutInput
              label="Street Address *"
              required
              autoComplete="street-address"
              value={address}
              onChange={setAddress}
              placeholder="Nguyễn Huệ, Quận 1, Tp.HCM"
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <CheckoutInput
                label="City *"
                required
                autoComplete="address-level2"
                value={city}
                onChange={setCity}
                placeholder="Ho Chi Minh City"
              />
              <CheckoutInput
                label="State / Province"
                autoComplete="address-level1"
                placeholder="Sông Bé"
              />
              <CheckoutInput
                label="ZIP / Postal Code *"
                required
                autoComplete="postal-code"
                value={zipCode}
                onChange={setZipCode}
                placeholder="70000"
              />
            </div>
          </Card>

          <Card className="space-y-5 rounded-md border-[#1c1a18]/5 bg-white p-8 py-8">
            <SectionTitle number="3" title="Payment Details" />
            <div>
              <FieldLabel>Card Number *</FieldLabel>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#1c1a18]/60" />
                <Input
                  required
                  autoComplete="cc-number"
                  maxLength={19}
                  value={cardNumber}
                  onChange={(event) => setCardNumber(event.target.value)}
                  placeholder="4111 8888 2222 0000"
                  className="h-12 rounded-sm border-[#1c1a18]/15 bg-[#f7f4ef]/30 pl-10 pr-4 font-serif text-sm tracking-widest focus-visible:border-[#b85a3c] focus-visible:ring-[#b85a3c]/20"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <CheckoutInput
                label="Expiration Date *"
                required
                autoComplete="cc-exp"
                maxLength={5}
                value={cardExpiry}
                onChange={setCardExpiry}
                placeholder="MM / YY"
              />
              <CheckoutInput
                label="Security Code *"
                required
                type="password"
                autoComplete="cc-csc"
                maxLength={4}
                value={cardCvc}
                onChange={setCardCvc}
                placeholder="000"
              />
            </div>
            <CheckoutInput
              label="Name on Card *"
              required
              autoComplete="cc-name"
              value={cardName}
              onChange={setCardName}
              placeholder="JONATHAN DOE"
            />
          </Card>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-auto w-full rounded-sm bg-[#1c1a18] py-[1.125rem] text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-md hover:bg-[#b85a3c] disabled:opacity-50"
          >
            <LockKeyhole className="size-4" />
            {isSubmitting ? "Completing Purchase..." : "Complete Purchase"}
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

          <form onSubmit={handleApplyCoupon} className="mb-8 flex gap-2">
            <Input
              value={couponCode}
              onChange={(event) => setCouponCode(event.target.value)}
              autoComplete="off"
              placeholder="VELA15 or AUTUMN"
              className="h-10 rounded-sm border-[#1c1a18]/15 bg-[#f7f4ef]/30 px-3 text-xs font-semibold uppercase tracking-wider focus-visible:border-[#b85a3c] focus-visible:ring-[#b85a3c]/20"
            />
            <Button
              type="submit"
              className="h-10 shrink-0 rounded-sm bg-[#1c1a18] px-4 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-[#b85a3c]"
            >
              Apply
            </Button>
          </form>

          <div className="space-y-4 border-t border-[#1c1a18]/5 pt-6 text-xs tracking-wide">
            <LedgerRow label="Subtotal" value={money(subtotal)} />
            {discountApplied && (
              <LedgerRow
                label="Discount (15%)"
                value={`-${money(discountAmount)}`}
                highlight
              />
            )}
            <LedgerRow
              label="Shipping"
              value={shipping === 0 ? "Complimentary" : money(shipping)}
            />
            <LedgerRow label="Estimated Taxes" value={money(taxes)} />
            <Separator className="my-4 bg-[#1c1a18]/10" />
            <div className="flex justify-between font-semibold text-[#1c1a18] md:text-base">
              <span>Total Due</span>
              <span className="font-serif text-lg tracking-wider text-[#b85a3c]">
                {money(total)}
              </span>
            </div>
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
  onChange,
  ...props
}: Omit<ComponentProps<typeof Input>, "onChange"> & {
  label: string;
  onChange?: (value: string) => void;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <Input
        {...props}
        onChange={(event) => onChange?.(event.target.value)}
        className="h-12 rounded-sm border-[#1c1a18]/15 bg-[#f7f4ef]/30 px-4 text-sm focus-visible:border-[#b85a3c] focus-visible:ring-[#b85a3c]/20"
      />
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
