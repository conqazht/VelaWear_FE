"use client";

import type { ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { FieldLabel } from "@/components/shop/field-label";

export function SectionTitle({ number, title }: { number: string; title: string }) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <span className="flex size-5 items-center justify-center rounded-full bg-[#1c1a18] text-[11px] font-semibold text-white">
        {number}
      </span>
      <h2 className="font-serif text-lg font-medium tracking-wide text-[#1c1a18]">{title}</h2>
    </div>
  );
}

export function CheckoutInput({
  label,
  error,
  id,
  name,
  ...props
}: ComponentProps<typeof Input> & {
  label: string;
  error?: string;
}) {
  const inputId = id || name;
  const errorId = inputId && error ? `${inputId}-error` : undefined;

  return (
    <div>
      <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
      <Input
        id={inputId}
        name={name}
        aria-invalid={!!error}
        aria-describedby={errorId}
        {...props}
        className="h-12 rounded-sm border-[#1c1a18]/15 bg-[#f7f4ef]/30 px-4 text-sm focus-visible:border-[#b5573a] focus-visible:ring-[#b5573a]/20"
      />
      {error && (
        <p id={errorId} className="text-error mt-1 text-xs">
          {error}
        </p>
      )}
    </div>
  );
}

export function LedgerRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={
        highlight ? "flex justify-between text-[#b5573a]" : "flex justify-between text-[#1c1a18]/65"
      }
    >
      <span>{label}</span>
      <span className="font-semibold text-[#1c1a18]">{value}</span>
    </div>
  );
}
