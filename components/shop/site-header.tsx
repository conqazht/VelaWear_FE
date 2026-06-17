"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, ShoppingBag, Heart, Search, X } from "lucide-react";

import { BrandMark } from "@/components/shop/brand-mark";
import { useCart } from "@/components/shop/cart-provider";
import { useFavorites } from "@/components/shop/favorites-provider";

export function SiteHeader() {
  const { itemCount } = useCart();
  const { favorites } = useFavorites();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // If path is /profile, simulate logged-in state to show member avatar
  const isLoggedIn = pathname === "/profile";

  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-canvas/95 backdrop-blur-md transition-all duration-300">
      <nav className="mx-auto flex h-20 w-full max-w-[1800px] items-center justify-between px-6 md:px-16">
        {/* Left: Brand Logo */}
        <div className="flex-none">
          <Link href="/" className="transition-opacity hover:opacity-90">
            <BrandMark />
          </Link>
        </div>

        {/* Right side group: Links, Search, Action Icons */}
        <div className="flex items-center gap-6 md:gap-8">
          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/collection"
              className="text-[#55423d]/80 hover:text-primary transition-colors text-sm font-medium tracking-[0.05em]"
            >
              Collections
            </Link>
            <Link
              href="/collection"
              className="text-[#55423d]/80 hover:text-primary transition-colors text-sm font-medium tracking-[0.05em]"
            >
              Lookbook
            </Link>
            <Link
              href="/collection"
              className="text-[#55423d]/80 hover:text-primary transition-colors text-sm font-medium tracking-[0.05em]"
            >
              Story
            </Link>
            <Link
              href="/collection"
              className="text-[#55423d]/80 hover:text-primary transition-colors text-sm font-medium tracking-[0.05em]"
            >
              Journal
            </Link>
          </div>

          {/* Help Link (Stitch design placement) */}
          <Link
            href="/help"
            className="hidden md:block text-[#55423d]/80 hover:text-primary transition-colors text-sm font-medium tracking-[0.05em]"
          >
            Help
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex items-center bg-surface-card rounded-full px-4 py-2 gap-2.5 w-44 focus-within:w-60 transition-all duration-300 border border-transparent focus-within:border-hairline">
            <Search className="size-4 text-[#55423d]/60" />
            <input
              type="text"
              placeholder="Search"
              className="bg-transparent border-none outline-none text-xs w-full text-ink placeholder-[#55423d]/50 focus:ring-0 p-0"
            />
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-4">
            {/* Wishlist Button */}
            <Link
              href="/profile?tab=favourites"
              aria-label="Favorites"
              className="relative inline-flex size-10 items-center justify-center rounded-full text-[#55423d] hover:bg-surface-card transition-colors"
            >
              <Heart className="size-5" />
              {favorites.length > 0 && (
                <span className="absolute right-0 top-0 flex size-5 items-center justify-center rounded-full border-2 border-canvas bg-[#b5573a] text-[9px] font-semibold text-white">
                  {favorites.length}
                </span>
              )}
            </Link>

            {/* Shopping Bag Button */}
            <Link
              href="/cart"
              aria-label="Open shopping bag"
              className="relative inline-flex size-10 items-center justify-center rounded-full text-[#55423d] hover:bg-surface-card transition-colors"
            >
              <ShoppingBag className="size-5" />
              {itemCount > 0 && (
                <span className="absolute right-0 top-0 flex size-5 items-center justify-center rounded-full border-2 border-canvas bg-[#b5573a] text-[9px] font-semibold text-white">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Member Profile Avatar or Join/Login Link */}
            <div className="hidden md:block">
              {isLoggedIn ? (
                <Link
                  href="/profile"
                  aria-label="View Profile"
                  className="flex size-8 items-center justify-center rounded-full border border-hairline bg-[#efe7dc] hover:bg-surface-card text-ink text-xs font-semibold transition-colors flex-shrink-0"
                >
                  E
                </Link>
              ) : (
                <Link
                  href="/profile"
                  className="text-sm font-medium text-[#55423d]/80 hover:text-primary transition-colors tracking-[0.05em] ml-2"
                >
                  Join / Log In
                </Link>
              )}
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="inline-flex size-10 items-center justify-center rounded-full text-[#55423d] hover:bg-surface-card md:hidden transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-x-0 top-20 bottom-0 z-40 bg-canvas animate-in fade-in slide-in-from-top-4 duration-300 md:hidden border-t border-hairline/50">
          <div className="flex flex-col p-6 gap-8 h-full overflow-y-auto">
            {/* Mobile Search */}
            <div className="flex items-center bg-surface-card rounded-md px-4 py-3 gap-3 w-full border border-hairline">
              <Search className="size-5 text-[#55423d]/60" />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                className="bg-transparent border-none outline-none text-sm w-full text-ink placeholder-[#55423d]/50 focus:ring-0 p-0"
              />
            </div>

            {/* Navigation Links */}
            <div className="flex flex-col gap-6 text-lg font-serif">
              <Link
                href="/collection"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-ink hover:text-primary py-2 border-b border-hairline/30"
              >
                Collections
              </Link>
              <Link
                href="/collection"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-ink/80 hover:text-primary py-2 border-b border-hairline/30"
              >
                Lookbook
              </Link>
              <Link
                href="/collection"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-ink/80 hover:text-primary py-2 border-b border-hairline/30"
              >
                Story
              </Link>
              <Link
                href="/collection"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-ink/80 hover:text-primary py-2 border-b border-hairline/30"
              >
                Journal
              </Link>
              <Link
                href="/help"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-ink/80 hover:text-primary py-2 border-b border-hairline/30"
              >
                Help
              </Link>
              <Link
                href="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-ink/80 hover:text-primary py-2 border-b border-hairline/30 font-medium"
              >
                {isLoggedIn ? "Eleanor (Profile)" : "Join / Log In"}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
