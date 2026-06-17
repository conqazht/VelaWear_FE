import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt="Vela Wear Logo"
      width={40}
      height={40}
      className={cn("h-10 w-auto object-contain select-none", className)}
      priority
    />
  );
}
