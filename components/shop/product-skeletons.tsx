import { cn } from "@/lib/utils";

type ProductSkeletonAspect = "portrait" | "square";

type ProductCardSkeletonProps = {
  imageAspect?: ProductSkeletonAspect;
  className?: string;
};

type ProductCardSkeletonGridProps = ProductCardSkeletonProps & {
  count?: number;
  gridClassName?: string;
};

const imageAspectClass: Record<ProductSkeletonAspect, string> = {
  portrait: "aspect-[3/4]",
  square: "aspect-square",
};

export function ProductCardSkeletonGrid({
  count = 6,
  imageAspect = "portrait",
  gridClassName,
  className,
}: ProductCardSkeletonGridProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-4 md:grid-cols-3", gridClassName)}>
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton
          key={index}
          imageAspect={imageAspect}
          className={className}
        />
      ))}
    </div>
  );
}

function ProductCardSkeleton({
  imageAspect = "portrait",
  className,
}: ProductCardSkeletonProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className={cn(imageAspectClass[imageAspect], "animate-pulse bg-[#efe7dc]")} />
      <div className="h-4 w-3/4 animate-pulse bg-[#efe7dc]" />
      <div className="h-4 w-1/3 animate-pulse bg-[#efe7dc]" />
    </div>
  );
}
