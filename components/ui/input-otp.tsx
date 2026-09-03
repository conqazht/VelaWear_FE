"use client";

import * as React from "react";
import { OTPInput, OTPInputContext, REGEXP_ONLY_DIGITS } from "input-otp";

import { cn } from "@/lib/utils";
import { MinusIcon } from "lucide-react";

function InputOTP({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string;
}) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn(
        "cn-input-otp flex items-center gap-2 has-disabled:opacity-50",
        containerClassName,
      )}
      spellCheck={false}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    />
  );
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn("flex items-center gap-2 sm:gap-2.5 md:gap-3", className)}
      {...props}
    />
  );
}

function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  index: number;
}) {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        "relative flex h-13 w-11 items-center justify-center rounded-xl border border-[#1c1a18]/20 bg-white/70 font-mono text-xl font-semibold text-[#1c1a18] shadow-xs transition-all duration-150 ease-out outline-none select-none sm:h-14 sm:w-12 md:h-14 md:w-12 md:text-2xl",
        "hover:border-[#1c1a18]/40 hover:bg-white/90",
        "data-[active=true]:z-10 data-[active=true]:scale-[1.03] data-[active=true]:border-[#b5573a] data-[active=true]:bg-white data-[active=true]:shadow-sm data-[active=true]:ring-2 data-[active=true]:ring-[#b5573a]/25",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[active=true]:aria-invalid:border-destructive data-[active=true]:aria-invalid:ring-destructive/20",
        "dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:border-white/30 dark:data-[active=true]:border-[#b5573a] dark:data-[active=true]:bg-white/10",
        className,
      )}
      {...props}
    >
      {char ? <span className="transition-transform duration-100 ease-out">{char}</span> : null}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-5 w-[2px] animate-pulse rounded-full bg-[#b5573a] duration-700 sm:h-6" />
        </div>
      )}
    </div>
  );
}

function InputOTPSeparator({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-separator"
      className={cn(
        "flex items-center justify-center px-0.5 text-[#1c1a18]/30 sm:px-1 dark:text-white/30",
        className,
      )}
      role="separator"
      {...props}
    >
      <MinusIcon className="size-3.5 stroke-[2.5] sm:size-4" />
    </div>
  );
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator, REGEXP_ONLY_DIGITS };
