import * as React from "react";

import { format, parseISO } from "date-fns";
import { enUS, vi } from "date-fns/locale";
import { CalendarIcon, Hash } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";

import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getIntlLocale } from "@/lib/i18n";

import type { InvoiceFormValues } from "./data";

const dateFields: Array<{
  id: string;
  labelKey: "admin.workflows.invoice.issuedDate" | "admin.workflows.invoice.dueDate";
  name: "issuedDate" | "paymentDueDate";
}> = [
  {
    id: "issued-date",
    labelKey: "admin.workflows.invoice.issuedDate",
    name: "issuedDate",
  },
  {
    id: "payment-due-date",
    labelKey: "admin.workflows.invoice.dueDate",
    name: "paymentDueDate",
  },
];

export function InvoiceDetails() {
  const { t } = useI18n();
  const { control, register } = useFormContext<InvoiceFormValues>();

  return (
    <section className="flex flex-col gap-3">
      <FieldGroup>
        <Field className="gap-1">
          <FieldLabel className="text-xs" htmlFor="reference-number">
            {t("admin.workflows.invoice.referenceNumber")}
          </FieldLabel>
          <InputGroup>
            <InputGroupInput id="reference-number" {...register("referenceNumber")} />
            <InputGroupAddon align="inline-end">
              <Hash />
            </InputGroupAddon>
          </InputGroup>
        </Field>

        <div className="grid gap-5 md:grid-cols-2">
          {dateFields.map((dateField) => (
            <Controller
              key={dateField.name}
              control={control}
              name={dateField.name}
              render={({ field }) => (
                <Field className="gap-1">
                  <FieldLabel className="text-xs" htmlFor={dateField.id}>
                    {t(dateField.labelKey)}
                  </FieldLabel>
                  <DatePicker id={dateField.id} value={field.value} onChange={field.onChange} />
                </Field>
              )}
            />
          ))}
        </div>
      </FieldGroup>
    </section>
  );
}

function DatePicker({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const { locale, t } = useI18n();
  const [open, setOpen] = React.useState(false);
  const date = parseDateValue(value);
  const formattedDate = date
    ? new Intl.DateTimeFormat(getIntlLocale(locale), {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(date)
    : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            id={id}
            variant="outline"
            data-empty={!date}
            className="data-[empty=true]:text-muted-foreground w-full justify-between text-left font-normal"
          />
        }
      >
        {formattedDate ?? <span>{t("admin.workflows.invoice.pickDate")}</span>}
        <CalendarIcon className="text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
        <Calendar
          className="w-full"
          locale={locale === "vi" ? vi : enUS}
          mode="single"
          selected={date}
          onSelect={(selectedDate) => {
            if (!selectedDate) return;

            onChange(format(selectedDate, "yyyy-MM-dd"));
            setOpen(false);
          }}
          defaultMonth={date}
        />
      </PopoverContent>
    </Popover>
  );
}

function parseDateValue(value: string) {
  const date = parseISO(value);

  return Number.isNaN(date.getTime()) ? undefined : date;
}
