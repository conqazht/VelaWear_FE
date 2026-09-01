"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import {
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  ArrowRight,
  RotateCcw,
  ShoppingBag,
  Mail,
  AlertTriangle,
  CreditCard,
  Wallet,
  Building2,
  QrCode,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { useI18n } from "@/components/providers/i18n-provider";
import { EASE_VELA } from "@/lib/motion-tokens";
import { money } from "@/lib/vela-data";

interface ProviderMeta {
  name: string;
  badgeBg: string;
  badgeText: string;
  icon: typeof CreditCard;
}

function getProviderMeta(rawProvider: string): ProviderMeta {
  const normalized = rawProvider.toLowerCase();
  switch (normalized) {
    case "momo":
      return {
        name: "Ví MoMo",
        badgeBg: "bg-[#d82d8b]/10 border-[#d82d8b]/20",
        badgeText: "text-[#d82d8b]",
        icon: Wallet,
      };
    case "vnpay":
      return {
        name: "Cổng thanh toán VNPay",
        badgeBg: "bg-[#005baa]/10 border-[#005baa]/20",
        badgeText: "text-[#005baa]",
        icon: QrCode,
      };
    case "stripe":
      return {
        name: "Thẻ quốc tế (Stripe)",
        badgeBg: "bg-[#635bff]/10 border-[#635bff]/20",
        badgeText: "text-[#635bff]",
        icon: CreditCard,
      };
    case "sepay":
      return {
        name: "Chuyển khoản SePay (VietQR)",
        badgeBg: "bg-[#008060]/10 border-[#008060]/20",
        badgeText: "text-[#008060]",
        icon: Building2,
      };
    default:
      return {
        name: rawProvider.toUpperCase(),
        badgeBg: "bg-[#1c1a18]/5 border-[#1c1a18]/15",
        badgeText: "text-[#1c1a18]",
        icon: CreditCard,
      };
  }
}

export function PaymentReturnClient() {
  const params = useParams<{ provider: string }>();
  const searchParams = useSearchParams();
  const { locale, t } = useI18n();
  const reduce = useReducedMotion();

  const [isCopied, setIsCopied] = useState(false);

  const provider = params?.provider ?? "payment";
  const providerMeta = useMemo(() => getProviderMeta(provider), [provider]);

  const { orderCode, amount, transactionCode, isSuccess, rawMessage } = useMemo(() => {
    const rawOrderCode =
      searchParams.get("orderId") ||
      searchParams.get("vnp_TxnRef") ||
      searchParams.get("order_code") ||
      searchParams.get("orderCode") ||
      searchParams.get("order_invoice_number") ||
      "";

    let rawAmount: number | null = null;
    const vnpAmount = searchParams.get("vnp_Amount");
    if (vnpAmount) {
      const parsed = Number(vnpAmount);
      if (Number.isFinite(parsed)) rawAmount = parsed / 100;
    }
    if (rawAmount === null) {
      const generalAmount = searchParams.get("amount");
      if (generalAmount) {
        const parsed = Number(generalAmount);
        if (Number.isFinite(parsed)) rawAmount = parsed;
      }
    }

    const tx =
      searchParams.get("transId") ||
      searchParams.get("vnp_TransactionNo") ||
      searchParams.get("vnp_BankTranNo") ||
      searchParams.get("session_id") ||
      searchParams.get("transaction_id") ||
      searchParams.get("transactionCode") ||
      "";

    const momoResult = searchParams.get("resultCode");
    const vnpResponse = searchParams.get("vnp_ResponseCode");
    const stripeFlag = searchParams.get("stripe");
    const sepayStatus = searchParams.get("status");

    let success = false;
    if (momoResult !== null) {
      success = momoResult === "0";
    } else if (vnpResponse !== null) {
      success = vnpResponse === "00";
    } else if (stripeFlag !== null) {
      success = stripeFlag === "success";
    } else if (sepayStatus !== null) {
      success = sepayStatus.toUpperCase() === "PAID" || sepayStatus === "success";
    } else {
      success =
        searchParams.get("success") === "true" ||
        searchParams.get("result") === "success" ||
        Boolean(searchParams.get("session_id"));
    }

    const message =
      searchParams.get("message") ||
      searchParams.get("vnp_OrderInfo") ||
      (success ? undefined : t("sale.payment.return.failedSubtitle"));

    return {
      orderCode: rawOrderCode,
      amount: rawAmount,
      transactionCode: tx,
      isSuccess: success,
      rawMessage: message,
    };
  }, [searchParams, t]);

  const handleCopyOrderCode = useCallback(() => {
    if (!orderCode) return;
    void navigator.clipboard?.writeText(orderCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }, [orderCode]);

  const ProviderIcon = providerMeta.icon;

  return (
    <div className="flex min-h-[calc(100dvh-12rem)] w-full items-center justify-center px-4 py-10 sm:px-6">
      <motion.div
        initial={{
          opacity: 0,
          transform: reduce ? "none" : "scale(0.97) translateY(12px)",
        }}
        animate={{
          opacity: 1,
          transform: "scale(1) translateY(0px)",
        }}
        transition={{
          duration: reduce ? 0.25 : 0.4,
          ease: EASE_VELA,
        }}
        className="mx-auto w-full max-w-[500px]"
      >
        <Card className="flex flex-col items-center rounded-xl border-[#1c1a18]/8 bg-white p-6 text-center shadow-lg shadow-black/[0.03] sm:p-8">
          {/* Status Badge Icon */}
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
                    delay: 0.15,
                  }
            }
            className={`mb-4 flex size-14 items-center justify-center rounded-full ${
              isSuccess ? "bg-emerald-500/10 text-emerald-600" : "bg-[#b5573a]/10 text-[#b5573a]"
            }`}
          >
            {isSuccess ? (
              <CheckCircle2 className="size-8 stroke-[2.2]" />
            ) : (
              <XCircle className="size-8 stroke-[2.2]" />
            )}
          </motion.div>

          {/* Heading */}
          <h1 className="mb-2 font-serif text-2xl font-normal tracking-tight text-[#1c1a18] sm:text-[28px]">
            {isSuccess
              ? t("sale.payment.return.successTitle")
              : t("sale.payment.return.failedTitle")}
          </h1>
          <p className="mb-6 max-w-sm text-xs leading-relaxed text-[#1c1a18]/65 sm:text-sm">
            {isSuccess
              ? t("sale.payment.return.successSubtitle")
              : rawMessage || t("sale.payment.return.failedSubtitle")}
          </p>

          {/* Provider pill */}
          <div
            className={`mb-5 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${providerMeta.badgeBg} ${providerMeta.badgeText}`}
          >
            <ProviderIcon className="size-3.5" />
            <span>{providerMeta.name}</span>
          </div>

          {/* Structured Receipt Box */}
          <div className="w-full space-y-4">
            <div className="w-full rounded-lg border border-[#1c1a18]/8 bg-[#fdfbf7] p-4 text-left text-xs">
              {/* Order Code Row */}
              {orderCode && (
                <div className="flex items-center justify-between border-b border-[#1c1a18]/6 pb-3">
                  <span className="text-[11px] font-medium tracking-wider text-[#1c1a18]/55 uppercase">
                    {t("sale.payment.return.orderCode")}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold tracking-wider text-[#1c1a18]">
                      {orderCode}
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
                          <span className="font-medium text-emerald-600">
                            {t("checkout.copied")}
                          </span>
                        </>
                      ) : (
                        <>
                          <Copy className="size-3" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Key Details */}
              <div className="space-y-2.5 border-b border-[#1c1a18]/6 py-3 text-xs">
                {/* Gateway Provider */}
                <div className="flex items-center justify-between">
                  <span className="text-[#1c1a18]/60">{t("sale.payment.return.provider")}</span>
                  <span className="font-medium text-[#1c1a18]">{providerMeta.name}</span>
                </div>

                {/* Transaction Reference if present */}
                {transactionCode && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#1c1a18]/60">
                      {t("sale.payment.return.transactionCode")}
                    </span>
                    <span className="font-mono text-[11px] text-[#1c1a18]/80">
                      {transactionCode}
                    </span>
                  </div>
                )}

                {/* Status Row */}
                <div className="flex items-center justify-between">
                  <span className="text-[#1c1a18]/60">{t("sale.payment.return.status")}</span>
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
                      isSuccess
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-800"
                        : "border-amber-500/20 bg-amber-500/10 text-amber-800"
                    }`}
                  >
                    {isSuccess
                      ? t("sale.payment.return.statusPaid")
                      : t("sale.payment.return.statusFailed")}
                  </span>
                </div>
              </div>

              {/* Total Amount if present */}
              {amount !== null && (
                <div className="flex items-center justify-between pt-3">
                  <span className="font-medium text-[#1c1a18]">
                    {t("sale.payment.return.amount")}
                  </span>
                  <span className="font-numeric text-base font-bold text-[#b5573a]">
                    {money(amount, locale)}
                  </span>
                </div>
              )}
            </div>

            {/* Warning or Email Notice */}
            {!isSuccess ? (
              <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-left text-[11px] leading-relaxed text-amber-900">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-700" />
                <span>{t("sale.payment.return.failureNotice")}</span>
              </div>
            ) : null}

            {/* Action Buttons */}
            <div className="w-full space-y-3 pt-2">
              {orderCode ? (
                <Link
                  href={`/profile/orders/${orderCode}`}
                  className="group relative flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#8f2f20] px-6 text-xs font-bold tracking-[0.12em] text-white uppercase shadow-sm transition-all hover:bg-[#6f2318] active:scale-[0.99]"
                >
                  <span>{t("sale.payment.return.viewOrder")}</span>
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              ) : !isSuccess ? (
                <Link
                  href="/checkout"
                  className="group relative flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#8f2f20] px-6 text-xs font-bold tracking-[0.12em] text-white uppercase shadow-sm transition-all hover:bg-[#6f2318] active:scale-[0.99]"
                >
                  <RotateCcw className="size-4" />
                  <span>{t("sale.payment.return.retryPayment")}</span>
                </Link>
              ) : null}

              <Link
                href="/"
                className="inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-lg border border-[#1c1a18]/15 bg-white px-6 text-xs font-semibold tracking-wider text-[#1c1a18]/80 uppercase shadow-2xs transition-colors hover:bg-[#1c1a18]/5"
              >
                <ShoppingBag className="size-4" />
                <span>{t("sale.payment.return.continueShopping")}</span>
              </Link>
            </div>
          </div>

          {/* Footer delivery notification */}
          {isSuccess && (
            <div className="mt-6 flex w-full items-center justify-center gap-1.5 border-t border-[#1c1a18]/6 pt-4 text-[11px] font-light text-[#1c1a18]/55">
              <Mail className="size-3.5 shrink-0 opacity-70" />
              <span>{t("sale.payment.return.emailNotice")}</span>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
