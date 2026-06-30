import { cn } from "@/lib/utils";

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  trailing?: React.ReactNode;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  bgColor?: string;
}

export function FloatingInput({
  label,
  id,
  trailing,
  className,
  type = "text",
  inputRef,
  bgColor = "bg-[#efe7dc]",
  ...props
}: FloatingInputProps) {
  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type={type}
        id={id}
        placeholder=" "
        className={cn(
          "peer w-full h-14 px-4 bg-transparent border border-ink rounded-sm text-sm text-[#1c1a18] outline-none transition-all focus:border-[#964025] focus:ring-0",
          trailing && "pr-12",
          className
        )}
        {...props}
      />
      <label
        htmlFor={id}
        className={cn(
          "absolute left-4 -top-2.5 px-1 text-xs text-[#55423d] transition-all duration-200",
          "peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:text-[#55423d]/60 peer-placeholder-shown:bg-transparent peer-placeholder-shown:px-0",
          "peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-[#964025] peer-focus:px-1",
          "pointer-events-none",
          bgColor,
          `peer-focus:${bgColor}`
        )}
      >
        {label}
      </label>
      {trailing && (
        <div className="absolute inset-y-0 right-3 flex items-center text-ink">
          {trailing}
        </div>
      )}
    </div>
  );
}
