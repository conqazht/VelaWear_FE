"use client";

import { Save, Send } from "lucide-react";

import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";

import { Invoice } from "./invoice";

export function InvoicePageContent() {
  const { t } = useI18n();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl leading-none font-medium tracking-tight">
            {t("admin.workflows.invoice.createTitle")}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t("admin.workflows.invoice.createDescription")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="outline">
            <Save data-icon="inline-start" />
            {t("admin.workflows.invoice.saveDraft")}
          </Button>
          <Button type="button">
            <Send data-icon="inline-start" />
            {t("admin.workflows.invoice.send")}
          </Button>
        </div>
      </div>

      <Invoice />
    </div>
  );
}
