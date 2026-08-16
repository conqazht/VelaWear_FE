import { cn } from "@/lib/utils";

export function FieldLabel({
  children,
  htmlFor,
  className,
}: {
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "mb-1 block w-full cursor-pointer text-[10px] font-semibold tracking-widest text-[#1c1a18]/60 uppercase",
        className,
      )}
    >
      {children}
    </label>
  );
}
