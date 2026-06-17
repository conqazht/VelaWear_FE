"use client";

import Link from "next/link";
import { ArrowRight, Minus, Plus, ShoppingBag, Tag, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FashionImage } from "@/components/shop/fashion-image";
import { useCart } from "@/components/shop/cart-provider";
import { money } from "@/lib/vela-data";

export function CartPageClient() {
  const { cart, subtotal, updateQuantity, removeItem } = useCart();
  const shipping = subtotal >= 500 || subtotal === 0 ? 0 : 15;
  const taxes = subtotal * 0.08;
  const total = subtotal + shipping + taxes;

  return (
    <div className="mx-auto w-full max-w-[1800px] px-6 py-12 md:px-16">
      <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="mb-1 font-serif text-3xl font-light tracking-wide text-[#1c1a18] md:text-4xl">
            Your Cart
          </h1>
          <p className="block text-xs uppercase tracking-widest text-[#1c1a18]/60">
            {cart.length === 0
              ? "Your cart is currently empty"
              : `${cart.length} unique designs handpicked`}
          </p>
        </div>
        <Link
          href="/collection"
          className="text-xs font-semibold uppercase tracking-wider text-[#b85a3c] hover:underline"
        >
          ← Continue Shopping
        </Link>
      </div>

      {cart.length === 0 ? (
        <div className="mx-auto max-w-md py-20 text-center">
          <ShoppingBag className="mx-auto mb-4 size-12 text-[#1c1a18]/20" />
          <p className="mb-8 text-sm leading-relaxed text-[#1c1a18]/60">
            Giỏ hàng của bạn đang trống. Hãy quay lại cửa hàng để chọn thêm
            nhiều sản phẩm dệt lanh thủ công độc đáo nhé.
          </p>
          <Link
            href="/collection"
            className="inline-flex items-center rounded-sm bg-[#1c1a18] px-8 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-[#b85a3c]"
          >
            Xem tất cả sản phẩm
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            {cart.map((item) => (
              <Card
                key={`${item.id}-${item.color}-${item.size}`}
                className="flex gap-6 rounded-sm border-[#1c1a18]/5 bg-white p-6 py-6 transition-shadow hover:shadow-md sm:flex-row"
              >
                <div className="relative mx-auto h-32 w-24 shrink-0 overflow-hidden rounded-sm bg-[#efebe4] sm:mx-0 sm:h-36 sm:w-28">
                  <FashionImage src={item.image} alt={item.name} />
                </div>

                <div className="flex flex-grow flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-serif text-lg font-semibold text-[#1c1a18] transition-colors hover:text-[#b85a3c]">
                        {item.name}
                      </h3>
                      <span className="whitespace-nowrap font-serif text-base font-light tracking-wider text-[#1c1a18]">
                        {money(item.price * item.quantity)}
                      </span>
                    </div>
                    <p className="mt-2 flex gap-4 text-[11px] uppercase tracking-wider text-[#1c1a18]/60">
                      <span>
                        Color:{" "}
                        <strong className="text-[#1c1a18]">{item.color}</strong>
                      </span>
                      <span>
                        Size:{" "}
                        <strong className="text-[#1c1a18]">{item.size}</strong>
                      </span>
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-[#1c1a18]/5 pt-4">
                    <div className="flex items-center gap-1.5 rounded-sm border border-[#1c1a18]/15 bg-[#efebe4]/30 px-2 py-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        aria-label="Decrease quantity"
                        className="size-8 rounded-full text-[#1c1a18] hover:bg-[#efebe4]"
                      >
                        <Minus className="size-3" />
                      </Button>
                      <span className="w-8 text-center text-xs font-bold text-[#1c1a18]">
                        {item.quantity}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        aria-label="Increase quantity"
                        className="size-8 rounded-full text-[#1c1a18] hover:bg-[#efebe4]"
                      >
                        <Plus className="size-3" />
                      </Button>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => removeItem(item.id)}
                      className="h-8 rounded-sm text-[10px] font-bold uppercase tracking-widest text-[#b85a3c] hover:bg-[#efebe4]"
                    >
                      <Trash2 className="size-3.5" />
                      Remove
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="sticky top-24 rounded-sm border-[#1c1a18]/5 bg-white p-8 py-8 shadow-sm lg:col-span-4">
            <h2 className="mb-6 font-serif text-xl font-light tracking-wide text-[#1c1a18]">
              Order Summary
            </h2>
            <div className="space-y-4 text-xs tracking-wide">
              <div className="flex justify-between text-[#1c1a18]/65">
                <span>Subtotal</span>
                <span className="font-semibold text-[#1c1a18]">
                  {money(subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-[#1c1a18]/65">
                <span>Standard Shipping</span>
                <span className="font-semibold text-[#1c1a18]">
                  {shipping === 0 ? "Complimentary" : money(shipping)}
                </span>
              </div>
              <div className="flex justify-between text-[#1c1a18]/65">
                <span>Estimated Taxes (8%)</span>
                <span className="font-semibold text-[#1c1a18]">
                  {money(taxes)}
                </span>
              </div>
              <Separator className="my-6 bg-[#1c1a18]/10" />
              <div className="flex justify-between text-sm font-semibold text-[#1c1a18] md:text-base">
                <span>Total Amount</span>
                <span className="font-serif text-lg tracking-wider">
                  {money(total)}
                </span>
              </div>
            </div>

            <div className="mt-6 flex items-start gap-2.5 rounded-sm bg-[#f7f4ef] p-3 text-[10px] leading-relaxed text-[#1c1a18]/65">
              <Tag className="mt-0.5 size-4 shrink-0 text-[#b85a3c]" />
              <span>
                Complimentary premium dust bags and signature gift boxing
                included in every VELA WEAR shipment.
              </span>
            </div>

            <Link
              href="/checkout"
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-sm bg-[#1c1a18] py-4 text-xs font-bold uppercase tracking-[0.2em] text-white shadow-md transition-colors hover:bg-[#b85a3c]"
            >
              Proceed to Checkout
              <ArrowRight className="size-4" />
            </Link>

            <p className="mt-4 text-center text-[10px] uppercase leading-relaxed tracking-widest text-[#1c1a18]/50">
              Complimentary shipping on orders over $500
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}
