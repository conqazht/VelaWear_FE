"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { EASE_VELA } from "@/lib/motion-tokens";
import { CheckCircle2, AlarmClock, Copy, Check, ArrowRight, FileText, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { money } from "@/lib/vela-data";
import type { CheckoutResponse, PaymentInitiationResponse } from "@/lib/checkout-api";
import { formatDate } from "@/lib/i18n/format";
import { useI18n } from "@/components/providers/i18n-provider";

export function formatRemainingTime(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1_000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function PaymentContinuationForm({
  paymentInitiation,
}: {
  paymentInitiation?: PaymentInitiationResponse | null;
}) {
  const { t } = useI18n();
  if (!paymentInitiation?.actionUrl) return null;

  return (
    <form
      action={paymentInitiation.actionUrl}
      method={paymentInitiation.method.toLowerCase()}
      className="w-full"
    >
      {Object.entries(paymentInitiation.fields ?? {}).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <Button
        type="submit"
        className="group relative flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#8f2f20] px-6 text-xs font-bold tracking-[0.12em] text-white uppercase shadow-sm transition-all hover:bg-[#6f2318] active:scale-[0.99]"
      >
        <span>{t("sale.checkout.payment.continue")}</span>
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </Button>
    </form>
  );
}

export function PaymentDeadline({
  paymentDueAt,
  reservationExpiresAt,
  serverTime,
  paymentInitiation,
}: {
  paymentDueAt: string;
  reservationExpiresAt?: string | null;
  serverTime?: string | null;
  paymentInitiation?: PaymentInitiationResponse | null;
}) {
  const { locale, t } = useI18n();
  const [clockOrigin] = useState(() => {
    const clientTime = Date.now();
    const parsedServerTime = serverTime ? Date.parse(serverTime) : Number.NaN;
    const serverOffset = Number.isFinite(parsedServerTime) ? parsedServerTime - clientTime : 0;

    return {
      serverOffset,
      initialNow: clientTime + serverOffset,
    };
  });
  const [now, setNow] = useState(clockOrigin.initialNow);

  useEffect(() => {
    const intervalId = window.setInterval(
      () => setNow(Date.now() + clockOrigin.serverOffset),
      1_000,
    );
    return () => window.clearInterval(intervalId);
  }, [clockOrigin.serverOffset]);

  const dueTimestamp = Date.parse(paymentDueAt);
  const releaseTimestamp = reservationExpiresAt ? Date.parse(reservationExpiresAt) : dueTimestamp;
  const remainingPaymentMs = Math.max(0, dueTimestamp - now);
  const remainingGraceMs = Math.max(0, releaseTimestamp - now);
  const isPastPaymentDue = now >= dueTimestamp;
  const isReleased = now >= releaseTimestamp;

  return (
    <div className="w-full">
      <div
        className={`w-full rounded-lg border p-4 text-left transition-colors ${
          isReleased
            ? "border-red-200 bg-red-50/70 text-red-800"
            : isPastPaymentDue
              ? "border-amber-200 bg-amber-50/70 text-amber-900"
              : "border-[#b5573a]/20 bg-[#b5573a]/5 text-[#1c1a18]"
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-[#b5573a]">
            <AlarmClock className="size-4 animate-pulse" />
            <span>
              {isReleased
                ? t("sale.checkout.payment.expiredTitle")
                : isPastPaymentDue
                  ? t("sale.checkout.payment.graceTitle")
                  : t("sale.checkout.payment.remainingTitle")}
            </span>
          </div>
          {!isReleased && (
            <span className="font-mono text-base font-bold tracking-wider text-[#b5573a] tabular-nums sm:text-lg">
              {formatRemainingTime(isPastPaymentDue ? remainingGraceMs : remainingPaymentMs)}
            </span>
          )}
        </div>
        <p className="mt-1.5 text-[11px] leading-relaxed text-[#1c1a18]/65">
          {isReleased
            ? t("sale.checkout.payment.releasedDescription")
            : t("sale.checkout.payment.deadlineDescription", {
                time: formatDate(dueTimestamp, locale, { timeStyle: "short" }),
                seconds: 30,
              })}
        </p>
      </div>
      {!isReleased && paymentInitiation?.actionUrl ? (
        <div className="mt-4">
          <PaymentContinuationForm paymentInitiation={paymentInitiation} />
        </div>
      ) : null}
    </div>
  );
}

export type OrderSuccessCardProps = {
  completedOrder: CheckoutResponse;
  locale: ReturnType<typeof useI18n>["locale"];
  t: ReturnType<typeof useI18n>["t"];
};

export function OrderSuccessCard({ completedOrder, locale, t }: OrderSuccessCardProps) {
  const reduce = useReducedMotion();
  const [isCopied, setIsCopied] = useState(false);
  const orderCode = completedOrder.orderCode;

  const handleCopyOrderCode = useCallback(() => {
    if (!orderCode) return;
    void navigator.clipboard?.writeText(orderCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }, [orderCode]);

  const hasPaymentGateway = Boolean(completedOrder.paymentInitiation?.actionUrl);

  return (
    <motion.div
      initial={{
        opacity: 0,
        transform: reduce ? "none" : "scale(0.97) translateY(10px)",
      }}
      animate={{
        opacity: 1,
        transform: "scale(1) translateY(0px)",
      }}
      transition={{
        duration: reduce ? 0.25 : 0.4,
        ease: EASE_VELA,
      }}
      className="mx-auto w-full max-w-[480px]"
    >
      <Card className="flex flex-col items-center rounded-xl border-[#1c1a18]/8 bg-white p-6 text-center shadow-lg shadow-black/[0.03] sm:p-8">
        {/* Check icon badge */}
        <motion.div
          initial={{ opacity: 0, transform: reduce ? "none" : "scale(0.3)" }}
          animate={{ opacity: 1, transform: "scale(1)" }}
          transition={
            reduce
              ? { duration: 0.2, ease: "easeOut" }
              : {
                  type: "spring",
                  stiffness: 380,
                  damping: 22,
                  delay: 0.2,
                }
          }
          className="mb-4 flex size-12 items-center justify-center rounded-full bg-[#b5573a]/10 text-[#b5573a]"
        >
          <CheckCircle2 className="size-7 stroke-[2.2]" />
        </motion.div>

        {/* Title & Subtitle */}
        <h1 className="mb-1.5 font-serif text-2xl font-normal tracking-tight text-[#1c1a18] sm:text-[26px]">
          {t("checkout.successTitle")}
        </h1>
        <p className="mb-6 max-w-xs text-xs leading-relaxed text-[#1c1a18]/65 sm:text-[13px]">
          {t("checkout.successDescription", { brand: "VELA WEAR" })}
        </p>

        <div className="w-full space-y-4">
          {/* Structured Receipt Summary Box */}
          <div className="w-full rounded-lg border border-[#1c1a18]/8 bg-[#fdfbf7] p-4 text-left text-xs">
            {/* Order Code Row with Copy */}
            <div className="flex items-center justify-between border-b border-[#1c1a18]/6 pb-3">
              <span className="text-[11px] font-medium tracking-wider text-[#1c1a18]/55 uppercase">
                {t("checkout.orderCode")}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-xs font-bold tracking-wider text-[#1c1a18]">
                  {completedOrder.orderCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopyOrderCode}
                  title={t("checkout.copyOrderCode")}
                  className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium text-[#1c1a18]/60 transition-colors hover:bg-[#1c1a18]/10 hover:text-[#1c1a18]"
                >
                  {isCopied ? (
                    <>
                      <Check className="size-3 text-emerald-600" />
                      <span className="font-medium text-emerald-600">{t("checkout.copied")}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Key-Value Details */}
            <div className="space-y-2.5 border-b border-[#1c1a18]/6 py-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#1c1a18]/60">{t("checkout.payment")}</span>
                <span className="font-medium text-[#1c1a18]">
                  {completedOrder.paymentMethod === "COD"
                    ? t("checkout.cod")
                    : completedOrder.paymentMethod === "SEPAY"
                      ? t("sale.checkout.payment.sepay")
                      : completedOrder.paymentMethod}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#1c1a18]/60">{t("checkout.status")}</span>
                <span className="inline-flex items-center rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-800">
                  {{
                    PENDING: t("order.status.pending"),
                    CONFIRMED: t("order.status.confirmed"),
                    PROCESSING: t("order.status.processing"),
                    SHIPPING: t("order.status.shipping"),
                    DELIVERED: t("order.status.delivered"),
                    CANCELLED: t("order.status.cancelled"),
                  }[completedOrder.status.toUpperCase()] ?? completedOrder.status}
                </span>
              </div>
            </div>

            {/* Total Amount */}
            <div className="flex items-center justify-between pt-3">
              <span className="font-medium text-[#1c1a18]">{t("checkout.total")}</span>
              <span className="font-numeric text-base font-bold text-[#b5573a]">
                {money(completedOrder.finalAmount, locale)}
              </span>
            </div>
          </div>

          {/* Payment Countdown / Action Banner if applicable */}
          {completedOrder.paymentDueAt ? (
            <div className="w-full">
              <PaymentDeadline
                paymentDueAt={completedOrder.paymentDueAt}
                reservationExpiresAt={completedOrder.reservationExpiresAt}
                serverTime={completedOrder.serverTime}
                paymentInitiation={completedOrder.paymentInitiation}
              />
            </div>
          ) : (
            completedOrder.paymentInitiation && (
              <div className="w-full">
                <PaymentContinuationForm paymentInitiation={completedOrder.paymentInitiation} />
              </div>
            )
          )}

          {/* Action Buttons */}
          <div className="w-full space-y-3 pt-1">
            <Link
              href={`/profile/orders/${completedOrder.orderCode}`}
              className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg px-6 text-xs font-bold tracking-[0.12em] uppercase transition-colors ${
                hasPaymentGateway
                  ? "border border-[#1c1a18]/15 bg-white text-[#1c1a18] shadow-2xs hover:bg-[#1c1a18]/5"
                  : "bg-[#1c1a18] text-white shadow-sm hover:bg-[#b5573a]"
              }`}
            >
              <FileText className="size-4" />
              <span>{t("checkout.viewOrder")}</span>
            </Link>

            <Link
              href="/"
              className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-lg px-6 text-xs font-semibold tracking-wider text-[#1c1a18]/60 uppercase transition-colors hover:text-[#1c1a18]"
            >
              <span>{t("checkout.continueShopping")}</span>
            </Link>
          </div>
        </div>

        {/* Footer delivery notification */}
        <div className="mt-6 flex w-full items-center justify-center gap-1.5 border-t border-[#1c1a18]/6 pt-4 text-[11px] font-light text-[#1c1a18]/55">
          <Mail className="size-3.5 shrink-0 opacity-70" />
          <span>{t("checkout.deliveryUpdates", { name: completedOrder.receiverName })}</span>
        </div>
      </Card>
    </motion.div>
  );
}
