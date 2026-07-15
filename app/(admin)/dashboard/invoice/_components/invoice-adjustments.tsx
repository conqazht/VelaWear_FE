import { Controller, useFormContext, useWatch } from "react-hook-form";

import { useI18n } from "@/components/providers/i18n-provider";
import { Field, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getIntlLocale } from "@/lib/i18n";

import { type InvoiceFormValues, invoiceTaxOptions } from "./data";

export function InvoiceAdjustments() {
  const { locale, t } = useI18n();
  const intlLocale = getIntlLocale(locale);
  const percentFormatter = new Intl.NumberFormat(intlLocale, { style: "percent" });
  const currencySymbol =
    new Intl.NumberFormat(intlLocale, { currency: "USD", style: "currency" })
      .formatToParts(0)
      .find((part) => part.type === "currency")?.value ?? "$";
  const taxNames: Record<string, string> = {
    "service-tax": t("admin.workflows.invoice.serviceTax"),
    none: t("admin.workflows.invoice.noTax"),
  };
  const { control, register } = useFormContext<InvoiceFormValues>();
  const discountType = useWatch({ control, name: "discountType" });

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-medium tracking-tight">{t("admin.workflows.invoice.adjustments")}</h2>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
        <Controller
          control={control}
          name="taxId"
          render={({ field }) => (
            <Field className="gap-1">
              <FieldLabel className="text-xs">{t("admin.workflows.invoice.tax")}</FieldLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder={t("admin.workflows.invoice.selectTax")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {invoiceTaxOptions.map((taxOption) => (
                      <SelectItem key={taxOption.id} value={taxOption.id}>
                        {taxNames[taxOption.id] ?? taxOption.name} ({percentFormatter.format(taxOption.rate / 100)})
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          )}
        />

        <div className="grid grid-cols-[1fr_112px] gap-4">
          <Controller
            control={control}
            name="discountType"
            render={({ field }) => (
              <Field className="gap-1">
                <FieldLabel className="text-xs">{t("admin.workflows.invoice.discount")}</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder={t("admin.workflows.invoice.discountType")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="fixed">{t("admin.workflows.invoice.fixedAmount")}</SelectItem>
                      <SelectItem value="percent">{t("admin.workflows.invoice.percent")}</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            )}
          />
          <Field className="gap-1">
            <FieldLabel className="text-xs opacity-0">{t("admin.workflows.invoice.value")}</FieldLabel>
            <InputGroup>
              <InputGroupInput
                type="number"
                step="0.01"
                aria-label={t("admin.workflows.invoice.discountValue")}
                {...register("discountValue", { valueAsNumber: true })}
              />
              <InputGroupAddon align="inline-end">{discountType === "fixed" ? currencySymbol : "%"}</InputGroupAddon>
            </InputGroup>
          </Field>
        </div>
      </div>
    </section>
  );
}
