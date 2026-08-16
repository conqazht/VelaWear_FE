import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

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
  imageAspect = "square",
  gridClassName,
  className,
}: ProductCardSkeletonGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3",
        gridClassName,
      )}
      aria-hidden="true"
    >
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} imageAspect={imageAspect} className={className} />
      ))}
    </div>
  );
}

function ProductCardSkeleton({ imageAspect = "square", className }: ProductCardSkeletonProps) {
  return (
    <div className={cn("overflow-hidden rounded-md bg-white", className)}>
      <div className="relative">
        <Skeleton className={cn(imageAspectClass[imageAspect], "rounded-none bg-[#efe7dc]")} />
        <Skeleton className="absolute top-4 right-4 size-8 rounded-full bg-[#e5dccf]" />
      </div>
      <div className="px-4 pt-5 pb-6">
        <Skeleton className="h-3 w-24 rounded-none bg-[#e5dccf]" />
        <Skeleton className="mt-3 h-5 w-3/4 rounded-none bg-[#e5dccf]" />
        <div className="mt-4 flex items-center gap-3">
          <Skeleton className="h-4 w-24 rounded-none bg-[#e5dccf]" />
          <Skeleton className="h-3 w-16 rounded-none bg-[#e5dccf]" />
        </div>
      </div>
    </div>
  );
}
