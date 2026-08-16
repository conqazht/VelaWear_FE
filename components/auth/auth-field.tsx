import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

interface AuthFieldProps extends ComponentProps<"input"> {
  trailing?: React.ReactNode;
}

export function AuthField({ className, trailing, ...props }: AuthFieldProps) {
  return (
    <div className="relative">
      <input
        {...props}
        className={cn(
          "h-12 w-full rounded-[12px] border border-[#e3dccf] bg-[#f7f4ef] px-4 text-base text-[#1c1a18] transition-colors outline-none placeholder:text-[#55423d]/50 focus:border-[#b5573a] focus:ring-2 focus:ring-[#b5573a]/15",
          trailing && "pr-12",
          className,
        )}
      />
      {trailing && (
        <div className="absolute inset-y-0 right-3 flex items-center text-[#55423d]/60">
          {trailing}
        </div>
      )}
    </div>
  );
}
