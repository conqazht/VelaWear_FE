import { useI18n } from "@/components/providers/i18n-provider";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ClientSelector } from "./client-selector";
import { InvoiceAdjustments } from "./invoice-adjustments";
import { InvoiceDetails } from "./invoice-details";
import { InvoiceItems } from "./invoice-items";

export function InvoiceForm() {
  const { t } = useI18n();

  return (
    <div className="bg-card flex flex-col gap-4 rounded-xl border p-4">
      <Tabs defaultValue="invoice">
        <TabsList className="w-full">
          <TabsTrigger value="invoice">{t("admin.workflows.invoice.invoice")}</TabsTrigger>
          <TabsTrigger value="payment">{t("admin.workflows.invoice.payment")}</TabsTrigger>
          <TabsTrigger value="business">{t("admin.workflows.invoice.business")}</TabsTrigger>
        </TabsList>
      </Tabs>

      <InvoiceDetails />

      <Separator />

      <ClientSelector />

      <Separator />

      <InvoiceItems />

      <Separator />

      <InvoiceAdjustments />
    </div>
  );
}
