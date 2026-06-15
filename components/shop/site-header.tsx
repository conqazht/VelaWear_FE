"use client";

import Link from "next/link";
import { Menu, ShoppingBag } from "lucide-react";

import { BrandMark } from "@/components/shop/brand-mark";
import { useCart } from "@/components/shop/cart-provider";

export function SiteHeader() {
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-50 border-b border-[#1c1a18]/5 bg-[#f7f4ef]/95 backdrop-blur-md">
      <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 md:px-12">
        <div className="flex items-center gap-6 md:gap-8">
          <Link
            href="/collection"
            aria-label="Open collections"
            className="inline-flex size-9 items-center justify-center rounded-full text-[#1c1a18] hover:bg-[#efebe4] sm:hidden"
          >
            <Menu className="size-5" />
          </Link>
          <Link
            href="/collection"
            className="hidden text-xs font-medium uppercase tracking-[0.2em] text-[#1c1a18]/75 transition-colors hover:text-[#1c1a18] sm:inline"
          >
            Collections
          </Link>
          <span className="hidden text-[10px] uppercase tracking-[0.25em] text-[#1c1a18]/40 md:inline">
            Lookbook
          </span>
          <span className="hidden text-[10px] uppercase tracking-[0.25em] text-[#1c1a18]/40 md:inline">
            Story
          </span>
        </div>

        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 transition-opacity hover:opacity-80"
        >
          <BrandMark />
        </Link>

        <Link
          href="/cart"
          aria-label="Open shopping bag"
          className="relative inline-flex size-10 items-center justify-center rounded-full text-[#1c1a18] hover:bg-[#efebe4]"
        >
          <ShoppingBag className="size-5" />
          {itemCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full border-2 border-[#f7f4ef] bg-[#b85a3c] text-[9px] font-semibold text-white">
              {itemCount}
            </span>
          )}
        </Link>
      </nav>
    </header>
  );
}
