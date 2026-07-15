"use client";

import * as React from "react";

import { subDays } from "date-fns";
import { enUS, vi } from "date-fns/locale";
import type { DateRange } from "react-day-picker";

import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDate } from "@/lib/i18n/format";

interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (value: DateRange | undefined) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const { locale, t } = useI18n();
  const [open, setOpen] = React.useState(false);
  const [internalDateRange, setInternalDateRange] = React.useState<DateRange | undefined>(() => {
    const to = new Date();
    const from = subDays(to, 29);
    return { from, to };
  });
  const dateRange = value ?? internalDateRange;
  let dateRangeLabel = t("dateRange.select");

  if (dateRange?.from) {
    dateRangeLabel = formatDate(dateRange.from, locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  if (dateRange?.from && dateRange.to) {
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "short",
      year: "numeric",
    };
    dateRangeLabel = `${formatDate(dateRange.from, locale, options)} - ${formatDate(dateRange.to, locale, options)}`;
  }

  const handleDateChange = (nextValue: DateRange | undefined) => {
    if (!value) {
      setInternalDateRange(nextValue);
    }
    onChange?.(nextValue);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button variant="outline" id="date" className="font-normal">
            {dateRangeLabel}
          </Button>
        }
      />
      <PopoverContent className="w-auto overflow-hidden p-0" align="end">
        <Calendar
          mode="range"
          defaultMonth={dateRange?.from}
          selected={dateRange}
          onSelect={handleDateChange}
          numberOfMonths={2}
          locale={locale === "vi" ? vi : enUS}
        />
      </PopoverContent>
    </Popover>
  );
}
