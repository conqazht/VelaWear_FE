import { cn } from "@/lib/utils";

interface FashionImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

export function FashionImage({
  src,
  alt,
  className,
}: FashionImageProps) {
  return (
    <div
      aria-label={alt}
      role="img"
      className={cn("absolute inset-0 h-full w-full bg-cover bg-center", className)}
      style={{ backgroundImage: `url("${src}")` }}
    />
  );
}
