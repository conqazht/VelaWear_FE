"use client";

import * as React from "react";

import { Download, Printer } from "lucide-react";

import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Skeleton } from "@/components/ui/skeleton";

import {
  INVOICE_PAPER_HEIGHT,
  INVOICE_PAPER_SCALE,
  INVOICE_PAPER_WIDTH,
  type InvoiceFormValues,
} from "./data";
import { InvoicePaper } from "./invoice-paper";
import { PrintInvoice } from "./print-invoice";
import { useVisibleCenterPosition } from "./use-visible-center-position";

function handlePrint() {
  window.print();
}

export function InvoicePreview({ invoice }: { invoice: InvoiceFormValues }) {
  const { t } = useI18n();
  const previewBodyRef = React.useRef<HTMLDivElement>(null);
  const paperLayout = useVisibleCenterPosition(previewBodyRef, {
    height: INVOICE_PAPER_HEIGHT,
    maxScale: INVOICE_PAPER_SCALE,
    width: INVOICE_PAPER_WIDTH,
  });

  return (
    <>
      <PrintInvoice invoice={invoice} />
      <div className="bg-card flex flex-col rounded-xl border">
        <div className="flex items-center justify-between px-4 py-4">
          <h2 className="text-lg font-medium">{t("admin.workflows.invoice.preview")}</h2>
          <ButtonGroup>
            <Button type="button" variant="outline" onClick={handlePrint}>
              <Printer data-icon="inline-start" />
              {t("admin.workflows.invoice.print")}
            </Button>
            <Button type="button" variant="outline">
              <Download data-icon="inline-start" />
              {t("admin.workflows.invoice.downloadPdf")}
            </Button>
          </ButtonGroup>
        </div>

        <div
          ref={previewBodyRef}
          className="@container/preview relative min-h-[calc(100svh-15rem)] flex-1 rounded-b-xl bg-stone-200 p-4 dark:bg-stone-800"
        >
          {paperLayout === null ? (
            <div className="absolute inset-4">
              <InvoicePreviewLoading />
            </div>
          ) : null}
          <div
            style={{
              height: paperLayout
                ? INVOICE_PAPER_HEIGHT * paperLayout.scale
                : INVOICE_PAPER_HEIGHT * INVOICE_PAPER_SCALE,
              top: paperLayout?.top ?? "50%",
              transform: paperLayout === null ? "translate(-50%, -50%)" : "translateX(-50%)",
              width: paperLayout
                ? INVOICE_PAPER_WIDTH * paperLayout.scale
                : INVOICE_PAPER_WIDTH * INVOICE_PAPER_SCALE,
            }}
            className="absolute left-1/2 opacity-0 data-[ready=true]:opacity-100"
            data-ready={paperLayout !== null}
          >
            <div
              style={{ transform: `scale(${paperLayout?.scale ?? INVOICE_PAPER_SCALE})` }}
              className="origin-top-left"
            >
              <InvoicePaper invoice={invoice} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function InvoicePreviewLoading() {
  return (
    <article
      className="mx-auto flex h-full max-w-[min(100%,48rem)] flex-col overflow-hidden rounded-sm bg-white p-6 sm:p-10"
      aria-hidden="true"
    >
      <div className="flex items-start justify-between gap-8">
        <div className="space-y-3">
          <Skeleton className="h-8 w-36 bg-stone-200" />
          <Skeleton className="h-3 w-24 bg-stone-200" />
        </div>
        <div className="space-y-2 text-right">
          <Skeleton className="ml-auto h-3 w-28 bg-stone-200" />
          <Skeleton className="ml-auto h-3 w-20 bg-stone-200" />
        </div>
      </div>

      <div className="my-7 h-px bg-stone-200" />

      <section className="grid grid-cols-2 gap-8">
        {Array.from({ length: 2 }, (_, index) => (
          <div key={index} className="space-y-3">
            <Skeleton className="h-3 w-20 bg-stone-200" />
            <Skeleton className="h-4 w-36 max-w-full bg-stone-200" />
            <Skeleton className="h-3 w-44 max-w-full bg-stone-200" />
          </div>
        ))}
      </section>

      <div className="mt-8 overflow-hidden rounded-sm border border-stone-200">
        <div className="grid grid-cols-[1fr_5rem_6rem] gap-4 bg-stone-100 p-3">
          <Skeleton className="h-3 w-24 bg-stone-200" />
          <Skeleton className="h-3 w-10 bg-stone-200" />
          <Skeleton className="h-3 w-14 bg-stone-200" />
        </div>
        {Array.from({ length: 5 }, (_, index) => (
          <div
            key={index}
            className="grid grid-cols-[1fr_5rem_6rem] gap-4 border-t border-stone-100 p-3"
          >
            <Skeleton className="h-3 w-3/4 bg-stone-200" />
            <Skeleton className="h-3 w-8 bg-stone-200" />
            <Skeleton className="h-3 w-16 bg-stone-200" />
          </div>
        ))}
      </div>

      <div className="mt-7 ml-auto w-52 max-w-full space-y-3">
        <div className="flex justify-between gap-4">
          <Skeleton className="h-3 w-20 bg-stone-200" />
          <Skeleton className="h-3 w-16 bg-stone-200" />
        </div>
        <div className="flex justify-between gap-4 border-t border-stone-200 pt-3">
          <Skeleton className="h-4 w-16 bg-stone-200" />
          <Skeleton className="h-4 w-20 bg-stone-200" />
        </div>
      </div>
    </article>
  );
}
