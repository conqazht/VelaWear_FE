import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "font-serif text-xl font-semibold tracking-[0.3em] text-[#1c1a18] md:text-2xl",
        className
      )}
    >
      VELA WEAR
    </span>
  );
}
