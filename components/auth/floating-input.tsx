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
        className="block text-[14px] font-semibold text-[#1c1a18] mb-2 select-none border-none"
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
            "w-full px-4 py-3 rounded-[12px] border border-solid transition-all bg-white/60 text-[15px] text-[#1c1a18] outline-none h-12",
            error
              ? "border-red-500 bg-white/60 focus:border-red-500 focus:bg-white/85 focus:ring-2 focus:ring-red-500/5"
              : isFocused
              ? "border-[#b5573a] bg-white/85 ring-2 ring-black/5"
              : "border-black/20",
            trailing && "pr-12",
            className
          )}
          {...props}
        />
        {trailing && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center text-ink z-20 border-none bg-transparent">
            {trailing}
          </div>
        )}
      </div>
    </div>
  );
}
