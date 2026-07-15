"use client";

import { useI18n } from "@/components/providers/i18n-provider";
import { getIntlLocale } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";

import {
  getInvoiceDiscount,
  getInvoiceItems,
  getInvoiceSubtotal,
  getInvoiceTax,
  getInvoiceTaxOption,
  getInvoiceTotal,
  getLineAmount,
  INVOICE_PAPER_HEIGHT,
  INVOICE_PAPER_WIDTH,
  type InvoiceFormValues,
} from "./data";

export function InvoicePaper({ invoice }: { invoice: InvoiceFormValues }) {
  const { locale, t } = useI18n();
  const intlLocale = getIntlLocale(locale);
  const numberFormatter = new Intl.NumberFormat(intlLocale);
  const percentFormatter = new Intl.NumberFormat(intlLocale, { style: "percent" });
  const dateFormatter = new Intl.DateTimeFormat(intlLocale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const formatInvoiceDate = (value: string) => {
    const date = new Date(`${value}T12:00:00`);
    return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
  };
  const formatInvoiceCurrency = (value: number) =>
    formatCurrency(Number.isFinite(value) ? value : 0, {
      locale: intlLocale,
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    });
  const taxOption = getInvoiceTaxOption(invoice);
  const taxNames: Record<string, string> = {
    "service-tax": t("admin.workflows.invoice.serviceTax"),
    none: t("admin.workflows.invoice.noTax"),
  };
  const discountValue = Number.isFinite(invoice.discountValue) ? invoice.discountValue : 0;
  const discountLabel =
    invoice.discountType === "percent"
      ? t("admin.workflows.invoice.discountPercent", { percent: percentFormatter.format(discountValue / 100) })
      : t("admin.workflows.invoice.discount");

  return (
    <article
      style={{ width: INVOICE_PAPER_WIDTH, height: INVOICE_PAPER_HEIGHT }}
      data-print-paper
      className="relative flex flex-col gap-24 bg-neutral-50 px-12.25 py-11 font-mono text-neutral-950"
    >
      <header className="flex flex-col gap-10">
        <div className="grid grid-cols-2 items-start gap-14">
          <svg className="size-12" viewBox="0 0 48 48" aria-hidden="true">
            <rect width="20" height="20" rx="3" fill="currentColor" />
            <rect x="28" width="20" height="20" rx="3" fill="currentColor" />
            <rect y="28" width="20" height="20" rx="3" fill="currentColor" />
            <rect x="28" y="28" width="20" height="20" rx="3" fill="currentColor" />
          </svg>
          <h2 className="text-4xl uppercase tracking-widest">{t("admin.workflows.invoice.invoice")}</h2>
        </div>

        <section className="grid grid-cols-2 gap-14 text-sm leading-relaxed">
          <div>
            <p>{t("admin.workflows.invoice.reference", { reference: invoice.referenceNumber })}</p>
            <p>{t("admin.workflows.invoice.issued", { date: formatInvoiceDate(invoice.issuedDate) })}</p>
            <p>{t("admin.workflows.invoice.paymentDue", { date: formatInvoiceDate(invoice.paymentDueDate) })}</p>
          </div>
          <div>
            <p>{t("admin.workflows.invoice.paymentAccount")}</p>
            <p>{invoice.from.paymentAccountName}</p>
            <p>{t("admin.workflows.invoice.routingNumber", { number: invoice.from.routingNumber })}</p>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-14 text-sm leading-relaxed">
          <div>
            <p className="mb-4 font-semibold uppercase">{t("admin.workflows.invoice.from")}</p>
            <p>{invoice.from.name}</p>
            {invoice.from.addressLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
            <p>{t("admin.workflows.invoice.taxId", { id: invoice.from.taxId })}</p>
          </div>
          <div>
            <p className="mb-4 font-semibold uppercase">{t("admin.workflows.invoice.billTo")}</p>
            <p>{invoice.to.name}</p>
            {invoice.to.addressLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
            <p>{t("admin.workflows.invoice.taxId", { id: invoice.to.taxId })}</p>
          </div>
        </section>
      </header>

      <div className="flex flex-col gap-5">
        <section className="text-sm">
          <div className="grid grid-cols-[1fr_74px_116px_116px] bg-stone-200 px-3 py-3 font-semibold uppercase">
            <span>{t("admin.workflows.invoice.description")}</span>
            <span className="text-right">{t("admin.workflows.invoice.units")}</span>
            <span className="text-right">{t("admin.workflows.invoice.unitCost")}</span>
            <span className="text-right">{t("admin.workflows.invoice.lineTotal")}</span>
          </div>
          {getInvoiceItems(invoice).map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-[1fr_74px_116px_116px] border-[oklch(0.86_0_0)] border-b px-3 py-4"
            >
              <span>{item.description}</span>
              <span className="text-right">{numberFormatter.format(item.quantity)}</span>
              <span className="text-right">{formatInvoiceCurrency(item.unitPrice)}</span>
              <span className="text-right">{formatInvoiceCurrency(getLineAmount(item))}</span>
            </div>
          ))}
        </section>

        <div className="grid grid-cols-2 gap-14 text-sm leading-relaxed">
          <section className="col-start-2 space-y-2">
            <div>
              <div className="flex justify-between gap-8">
                <span>{t("admin.workflows.invoice.netAmount")}</span>
                <span>{formatInvoiceCurrency(getInvoiceSubtotal(invoice))}</span>
              </div>
              <div className="flex justify-between gap-8">
                <span>{discountLabel}</span>
                <span>{formatInvoiceCurrency(getInvoiceDiscount(invoice))}</span>
              </div>
              <div className="flex justify-between gap-8">
                <span>
                  {taxNames[taxOption.id] ?? taxOption.name} {percentFormatter.format(taxOption.rate / 100)}
                </span>
                <span>{formatInvoiceCurrency(getInvoiceTax(invoice))}</span>
              </div>
            </div>
            <div className="border-current border-y-2 py-3">
              <div className="flex justify-between gap-8">
                <span className="font-semibold uppercase">{t("admin.workflows.invoice.balanceDue")}</span>
                <span className="font-semibold">{formatInvoiceCurrency(getInvoiceTotal(invoice))}</span>
              </div>
            </div>
          </section>
        </div>
      </div>

      <footer className="absolute right-12.25 bottom-11 left-12.25 grid grid-cols-2 gap-14 text-neutral-500 text-sm leading-relaxed">
        <div>
          <p>{invoice.from.email}</p>
          <p>{invoice.from.phone}</p>
          <p>{invoice.from.website}</p>
        </div>
        <div>
          <p>{t("admin.workflows.invoice.processingNote")}</p>
          <p>{t("admin.workflows.invoice.issuedBy", { name: invoice.from.issuerName })}</p>
        </div>
      </footer>
    </article>
  );
}
