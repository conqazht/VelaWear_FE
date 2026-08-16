import { useState } from "react";
import { cn } from "@/lib/utils";

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  trailing?: React.ReactNode;
  inputRef?: React.Ref<HTMLInputElement>;
  error?: boolean;
}

export function FloatingInput({
  id,
  label,
  type,
  value,
  onChange,
  onFocus,
  onBlur,
  trailing,
  className,
  inputRef,
  error,
  ...props
}: FloatingInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative w-full border-none">
      <label
        htmlFor={id}
        className="mb-2 block border-none text-[14px] font-semibold text-[#1c1a18] select-none"
      >
        {label}
      </label>
      <div className="relative w-full border-none">
        <input
          id={id}
          ref={inputRef}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          className={cn(
            "h-12 w-full rounded-[12px] border border-solid bg-white/60 px-4 py-3 text-[15px] text-[#1c1a18] transition-all outline-none",
            error
              ? "border-red-500 bg-white/60 focus:border-red-500 focus:bg-white/85 focus:ring-2 focus:ring-red-500/5"
              : isFocused
                ? "border-[#b5573a] bg-white/85 ring-2 ring-black/5"
                : "border-black/20",
            trailing && "pr-12",
            className,
          )}
          {...props}
        />
        {trailing && (
          <div className="text-ink absolute top-1/2 right-4 z-20 flex -translate-y-1/2 items-center border-none bg-transparent">
            {trailing}
          </div>
        )}
      </div>
    </div>
  );
}
