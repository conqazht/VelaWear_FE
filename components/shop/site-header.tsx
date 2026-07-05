"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Heart, ShoppingBag, Menu, X, Trash2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/components/shop/cart-provider";
import { useFavorites } from "@/components/shop/favorites-provider";
import { useAuth } from "@/components/auth/auth-provider";
import { money } from "@/lib/vela-data";

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";

  const { cart, itemCount, subtotal, removeItem, clearCart } = useCart();
  const { favorites } = useFavorites();
  const { user, isAuthenticated, signOut } = useAuth();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCheckoutToast, setShowCheckoutToast] = useState(false);

  // Scroll state
  const [isScrolled, setIsScrolled] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Trigger once on mount
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const shouldBeTransparent = isHome && !isScrolled;

  const textClass = shouldBeTransparent
    ? "text-[#efe7dc] hover:text-[#ffb59f]"
    : "text-[#1c1a18] hover:text-[#b5573a]";

  const logoStyle = shouldBeTransparent
    ? { filter: "brightness(0) invert(1)" }
    : { filter: "brightness(0.15)" };

  const iconClass = shouldBeTransparent
    ? "text-[#efe7dc] hover:text-[#ffb59f]"
    : "text-[#1c1a18] hover:text-[#b5573a]";

  // Layout changes: fixed on home page (transparent or pill), sticky on other pages
  const headerClass = isHome
    ? `fixed top-0 inset-x-0 z-50 flex justify-center px-4 md:px-8 transition-all duration-500 ${
        isScrolled ? "py-4" : "py-8"
      }`
    : `sticky top-0 inset-x-0 z-50 flex justify-center px-4 md:px-8 py-4 transition-all duration-300`;

  const innerClass = isHome
    ? isScrolled
      ? "w-full max-w-[1800px] flex items-center justify-between rounded-full bg-white/20 border border-white/30 shadow-[0_12px_40px_rgba(28,26,24,0.06)] px-6 py-3 transition-all duration-500"
      : "w-full max-w-[1800px] flex items-center justify-between rounded-none bg-transparent border-b border-transparent px-4 md:px-8 py-2 transition-all duration-500"
    : "w-full max-w-[1800px] flex items-center justify-between rounded-full bg-[#f7f4ef]/90 border border-[#e3dccf]/60 shadow-[0_12px_40px_rgba(28,26,24,0.04)] px-6 py-3 transition-all duration-300";

  const burgerClass = shouldBeTransparent
    ? "text-[#efe7dc] hover:text-[#ffb59f]"
    : "text-[#1c1a18] hover:text-[#b5573a]";

  const searchBgClass = shouldBeTransparent ? "bg-white/10" : "bg-[#efe7dc]/80";

  const searchInputClass = shouldBeTransparent
    ? "text-[#efe7dc] placeholder-[#efe7dc]/50"
    : "text-[#1c1a18] placeholder-[#1c1a18]/50";

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className={headerClass}
      >
        <div
          className={innerClass}
          style={
            (isHome && isScrolled) || !isHome
              ? {
                  WebkitBackdropFilter: "blur(24px) saturate(160%)",
                  backdropFilter: "blur(24px) saturate(160%)",
                }
              : undefined
          }
        >
          {/* Hamburger button for mobile */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`${burgerClass} transition-colors p-1`}
              aria-label="Open menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Logo */}
          <div className="flex-none">
            <Link href="/" className="flex items-center gap-2 group relative">
              <motion.div
                className="relative flex items-center overflow-hidden rounded-md"
                style={{ perspective: 1000 }}
                animate={{
                  scale: isHome && !isScrolled ? 1.05 : 0.95,
                  rotateY: 0,
                  y: 0,
                }}
                whileHover="hover"
                variants={{
                  hover: {
                    scale: isHome && !isScrolled ? 1.15 : 1.05,
                    rotateY: 360,
                    y: -3,
                  },
                }}
                transition={{
                  type: "spring",
                  stiffness: 280,
                  damping: 18,
                  rotateY: { duration: 0.8, ease: "easeInOut" },
                }}
              >
                <img
                  suppressHydrationWarning
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBEBkBcpXeLbuJbgUCezINF6sMfVvIearyTwIMb5uBl08PFISvYOLRciNTSAIoobsPz1jpxL-hwUBhcjrSCnJaguWDgbzzKYHMPmDZ6gYteEWFpJYEhYqJf9t8Dv3WcygHY-JRNC_q7fYcWCMMtFYbqCqS3Uj8ntYwUAH2TAb7N0yD4erWe0mLkacJm3Clwk2N8T1YVvOTFPX3lf1uHXIJSAN0PfSFQZqn9wJ6IlS_--Sv7i486Uvk_RYogdH9Vp4NNWDVLOB2w3As_"
                  alt="Vela Wear Logo"
                  style={logoStyle}
                  className="h-8 md:h-9 w-auto object-contain transition-all duration-300"
                  referrerPolicy="no-referrer"
                />
                
                {/* Shine effect on hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/45 to-transparent pointer-events-none"
                  initial={{ x: "-150%", skewX: -20 }}
                  variants={{
                    hover: { x: "150%" },
                  }}
                  transition={{ duration: 0.75, ease: "easeInOut" }}
                />
              </motion.div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-10">
            <Link
              href="/collection"
              className={`text-sm font-medium tracking-[0.5px] ${textClass} transition-colors relative pb-1 group/link`}
            >
              Collections
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#b5573a] group-hover/link:w-full transition-all duration-300" />
            </Link>
            <Link
              href="/collection"
              className={`text-sm font-medium tracking-[0.5px] ${textClass} transition-colors relative pb-1 group/link`}
            >
              Lookbook
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#b5573a] group-hover/link:w-full transition-all duration-300" />
            </Link>
            <Link
              href="#editorial-craft"
              className={`text-sm font-medium tracking-[0.5px] ${textClass} transition-colors relative pb-1 group/link`}
            >
              Craftsmanship
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#b5573a] group-hover/link:w-full transition-all duration-300" />
            </Link>
            <Link
              href="#testimonials"
              className={`text-sm font-medium tracking-[0.5px] ${textClass} transition-colors relative pb-1 group/link`}
            >
              Reviews
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#b5573a] group-hover/link:w-full transition-all duration-300" />
            </Link>
          </nav>

          {/* Right side items */}
          <div className="flex items-center gap-4 md:gap-6">
            {/* Desktop Search bar */}
            <form
              onSubmit={handleSearchSubmit}
              className={`hidden lg:flex items-center ${searchBgClass} rounded-full px-4 py-2 gap-2.5 w-52 focus-within:w-68 transition-all duration-300 border border-transparent focus-within:border-[#b5573a]/20`}
            >
              <button type="submit" aria-label="Search" className="cursor-pointer focus:outline-none border-none p-0 bg-transparent flex items-center justify-center">
                <Search className={`w-4 h-4 ${shouldBeTransparent ? "text-[#efe7dc]/80" : "text-[#8a857c]"}`} />
              </button>
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-xs w-full ${searchInputClass}`}
              />
            </form>

            <div className="flex items-center gap-3">
              {/* Wishlist Link */}
              <Link href="/favorites">
                <motion.button
                  className={`${iconClass} p-2 rounded-full cursor-pointer relative`}
                  whileHover={{
                    scale: 1.1,
                    backgroundColor: shouldBeTransparent ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Wishlist"
                >
                  <Heart className="w-4.5 h-4.5" />
                  {favorites.length > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-0 right-0 w-4.5 h-4.5 rounded-full bg-[#b5573a] text-white text-[9px] font-bold flex items-center justify-center border border-[#f7f4ef]"
                    >
                      {favorites.length}
                    </motion.span>
                  )}
                </motion.button>
              </Link>

              {/* Shopping Bag Button (Redirects to /cart) */}
              <Link href="/cart">
                <motion.button
                  className={`${iconClass} p-2 rounded-full cursor-pointer relative`}
                  whileHover={{
                    scale: 1.1,
                    backgroundColor: shouldBeTransparent ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Shopping Bag"
                >
                  <ShoppingBag className="w-4.5 h-4.5" />
                  {itemCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-0 right-0 w-4.5 h-4.5 rounded-full bg-[#b5573a] text-white text-[9px] font-bold flex items-center justify-center border border-[#f7f4ef]"
                    >
                      {itemCount}
                    </motion.span>
                  )}
                </motion.button>
              </Link>

              {/* Account Profile / Login */}
              <div className="hidden md:flex items-center gap-4">
                {isAuthenticated && user ? (
                  <div className="flex items-center gap-3">
                    <Link
                      href="/profile"
                      aria-label="View Profile"
                      className={`flex size-8 items-center justify-center rounded-full border border-hairline bg-[#efe7dc] text-ink text-xs font-semibold hover:bg-white transition-colors flex-shrink-0`}
                    >
                      {user.fullName
                        ? user.fullName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .substring(0, 2)
                            .toUpperCase()
                        : "U"}
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        router.push("/");
                      }}
                      className={`text-xs font-medium ${textClass} cursor-pointer transition-colors`}
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/sign-in"
                    className={`text-[11px] font-semibold uppercase tracking-[1px] ${textClass} transition-colors ml-1`}
                  >
                    Log In
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Slidedown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`md:hidden bg-[#f7f4ef] overflow-hidden z-40 fixed left-4 right-4 w-[calc(100%-32px)] rounded-[24px] border border-[#e3dccf] shadow-2xl ${
              isHome && !isScrolled ? "top-[88px]" : "top-[78px]"
            }`}
          >
            <div className="px-6 py-8 flex flex-col gap-6">
              <Link
                href="/collection"
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-serif text-2xl text-[#1c1a18] hover:text-[#b5573a] transition-colors"
              >
                Collections
              </Link>
              <Link
                href="/collection"
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-serif text-2xl text-[#1c1a18] hover:text-[#b5573a] transition-colors"
              >
                Lookbook
              </Link>
              <Link
                href="#editorial-craft"
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-serif text-2xl text-[#1c1a18] hover:text-[#b5573a] transition-colors"
              >
                Craftsmanship
              </Link>
              <Link
                href="#testimonials"
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-serif text-2xl text-[#1c1a18] hover:text-[#b5573a] transition-colors"
              >
                Reviews
              </Link>
              <div className="h-[1px] bg-[#e3dccf] my-2" />
              
              {/* Mobile Search */}
              <form onSubmit={handleSearchSubmit} className="flex items-center bg-[#efe7dc] rounded-full px-4 py-3 gap-3 w-full border border-transparent">
                <Search className="w-5 h-5 text-[#8a857c]" />
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-sm w-full text-[#1c1a18]"
                />
              </form>

              {/* Mobile Account Profile */}
              {isAuthenticated && user ? (
                <div className="flex flex-col gap-4">
                  <Link
                    href="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-sm font-semibold uppercase tracking-[1px] text-[#1c1a18] text-center bg-[#efe7dc] py-4 rounded-[6px] hover:bg-[#b5573a] hover:text-white transition-colors duration-300"
                  >
                    View Profile ({user.fullName})
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setIsMobileMenuOpen(false);
                      router.push("/");
                    }}
                    className="text-sm font-semibold uppercase tracking-[1px] text-[#b5573a] text-center border border-[#b5573a]/40 py-4 rounded-[6px] hover:bg-[#b5573a]/10 transition-colors duration-300"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/sign-in"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-sm font-semibold uppercase tracking-[1px] text-[#1c1a18] text-center bg-[#efe7dc] py-4 rounded-[6px] hover:bg-[#b5573a] hover:text-white transition-colors duration-300"
                >
                  Log In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>



      {/* Toast popup */}
      <AnimatePresence>
        {showCheckoutToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 bg-[#1c1a18] text-white px-5 py-4 rounded-[10px] flex items-center gap-3 shadow-2xl border border-white/10"
          >
            <CheckCircle2 className="w-5 h-5 text-[#5d8a6c]" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[1px]">Thanh toán thành công</p>
              <p className="text-[11px] text-[#8a857c] mt-0.5">Vela Wear đang chuẩn bị đơn hàng cao cấp của bạn!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
