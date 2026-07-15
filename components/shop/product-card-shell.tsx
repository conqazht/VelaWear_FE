"use client";

import type { ReactNode } from "react";
import Link from "next/link";

import { FashionImage } from "@/components/shop/fashion-image";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ProductCardShellProps = {
  href: string;
  imageSrc: string;
  imageAlt: string;
  title: string;
  eyebrow: ReactNode;
  price: ReactNode;
  originalPrice?: ReactNode;
  badge?: ReactNode;
  imageAction?: ReactNode;
  imageOverlay?: ReactNode;
  imageClassName?: string;
  footerAction?: ReactNode;
};

export function ProductCardShell({
  href,
  imageSrc,
  imageAlt,
  title,
  eyebrow,
  price,
  originalPrice,
  badge,
  imageAction,
  imageOverlay,
  imageClassName,
  footerAction,
}: ProductCardShellProps) {
  return (
    <Card className="group relative h-full gap-0 overflow-hidden rounded-md border-transparent bg-white p-0 transition-[border-color,box-shadow] duration-200 ease-out hover:border-[#1c1a18]/5 hover:shadow-xl">
      <div className="relative aspect-square overflow-hidden rounded-none bg-[#efebe4]">
        <Link href={href} className="block h-full w-full">
          {badge ? (
            <Badge className="absolute left-4 top-4 z-20 rounded-sm bg-[#1c1a18] px-2 text-[9px] font-bold uppercase tracking-widest text-[#f7f4ef]">
              {badge}
            </Badge>
          ) : null}
          <FashionImage
            src={imageSrc}
            alt={imageAlt}
            className={cn("transition-none", imageClassName)}
          />
          {imageOverlay ? (
            <span className="pointer-events-none absolute inset-0 z-10">
              {imageOverlay}
            </span>
          ) : null}
        </Link>
        {imageAction ? (
          <div className="absolute right-4 top-4 z-20">{imageAction}</div>
        ) : null}
      </div>

      <div className="flex flex-grow flex-col items-start px-4 pb-6 pt-5 text-left">
        <div className="mb-1.5 text-[12px] font-medium uppercase tracking-widest text-[#1c1a18]/60 md:text-[13px]">
          {eyebrow}
        </div>
        <Link href={href}>
          <h3 className="mb-2.5 font-serif text-[16px] font-medium leading-snug text-[#1c1a18] transition-colors hover:text-[#b85a3c] md:text-[18px]">
            {title}
          </h3>
        </Link>
        <div className="mt-2 flex items-center gap-2.5">
          <span className="font-numeric text-[14px] font-semibold tracking-wider text-[#1c1a18] md:text-[15px]">
            {price}
          </span>
          {originalPrice ? (
            <span className="font-numeric text-[12px] font-light tracking-widest text-[#1c1a18]/40 line-through">
              {originalPrice}
            </span>
          ) : null}
        </div>
        {footerAction ? <div className="mt-auto w-full pt-5">{footerAction}</div> : null}
      </div>
    </Card>
  );
}
