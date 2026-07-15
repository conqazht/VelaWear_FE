"use client";

import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Heart, ShoppingBag, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/components/shop/cart-provider";
import { useFavorites } from "@/components/shop/favorites-provider";
import { useAuth } from "@/components/auth/auth-provider";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { NavigationMenu as BaseNavigationMenu } from "@base-ui/react/navigation-menu";
import { money } from "@/lib/vela-data";
import { getProducts } from "@/lib/api/catalog";
import { mapBackendProduct, type Product } from "@/lib/vela-data";
import { getActiveLocale } from "@/lib/i18n";
import { matchesSearchText, normalizeSearchText } from "@/lib/search";

const SEARCH_HISTORY_STORAGE_KEY = "vela-search-history";
const MAX_SEARCH_HISTORY_ITEMS = 5;

function readSearchHistory(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = window.localStorage.getItem(SEARCH_HISTORY_STORAGE_KEY);
    if (!stored) return [];

    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, MAX_SEARCH_HISTORY_ITEMS);
  } catch {
    return [];
  }
}

export function SiteHeader() {
  const hasMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";

  const { itemCount } = useCart();
  const { favorites } = useFavorites();
  const { user, isAuthenticated, signOut } = useAuth();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<Product[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>(readSearchHistory);
  const [isSearchSuggestionsOpen, setIsSearchSuggestionsOpen] = useState(false);
  const [searchPathname, setSearchPathname] = useState(pathname);

  // Scroll state
  const [isScrolled, setIsScrolled] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);
  const headerToggleAnchorY = useRef(0);
  const searchBoxRef = useRef<HTMLDivElement | null>(null);
  const searchDebounceRef = useRef<number | null>(null);
  const searchRequestIdRef = useRef(0);
  const activeLocale = getActiveLocale();

  if (searchPathname !== pathname) {
    setSearchPathname(pathname);
    setSearchQuery("");
    setSearchSuggestions([]);
    setIsSearchSuggestionsOpen(false);
  }

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollY.current;

      if (!isHome) {
        if (currentScrollY <= 24) {
          setShowHeader(true);
          headerToggleAnchorY.current = currentScrollY;
        } else if (scrollDelta > 0) {
          if (showHeader) {
            if (currentScrollY > 72 && currentScrollY - headerToggleAnchorY.current > 28) {
              setShowHeader(false);
              headerToggleAnchorY.current = currentScrollY;
            }
          } else {
            headerToggleAnchorY.current = currentScrollY;
          }
        } else if (scrollDelta < 0) {
          if (!showHeader) {
            if (headerToggleAnchorY.current - currentScrollY > 18) {
              setShowHeader(true);
              headerToggleAnchorY.current = currentScrollY;
            }
          } else {
            headerToggleAnchorY.current = currentScrollY;
          }
        }
      } else {
        setShowHeader(true);
      }

      if (currentScrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome, showHeader]);

  // Synchronize CSS custom property with header visibility state
  useEffect(() => {
    const root = document.documentElement;
    if (!isHome) {
      if (showHeader) {
        root.style.setProperty("--header-visible-height", "72px");
      } else {
        root.style.setProperty("--header-visible-height", "0px");
      }
    } else {
      root.style.setProperty("--header-visible-height", "0px");
    }
  }, [showHeader, isHome]);

  useEffect(() => {
    const trimmedQuery = searchQuery.trim();

    if (!trimmedQuery) {
      if (searchDebounceRef.current !== null) {
        window.clearTimeout(searchDebounceRef.current);
        searchDebounceRef.current = null;
      }
      return;
    }

    if (searchDebounceRef.current !== null) {
      window.clearTimeout(searchDebounceRef.current);
    }

    const requestId = ++searchRequestIdRef.current;
    searchDebounceRef.current = window.setTimeout(async () => {
      try {
        const data = await getProducts({ size: 500, locale: activeLocale });
        if (requestId !== searchRequestIdRef.current) return;

        const mapped = (data.result || []).map((product: Parameters<typeof mapBackendProduct>[0]) =>
          mapBackendProduct(product, activeLocale)
        );
        const normalizedQuery = normalizeSearchText(trimmedQuery);
        const filtered = mapped.filter((product) => {
          const searchable = [product.name, product.category, product.id, product.description]
            .filter(Boolean)
            .join(" ");
          return matchesSearchText(searchable, normalizedQuery);
        });

        setSearchSuggestions(filtered.slice(0, 4));
      } catch {
        if (requestId !== searchRequestIdRef.current) return;
      } finally {
        if (requestId === searchRequestIdRef.current) {
          searchDebounceRef.current = null;
        }
      }
    }, 180);
  }, [activeLocale, searchQuery]);

  useEffect(() => {
    try {
      window.localStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(searchHistory));
    } catch {
      // Ignore storage failures.
    }
  }, [searchHistory]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!searchBoxRef.current) return;
      if (!searchBoxRef.current.contains(event.target as Node)) {
        setIsSearchSuggestionsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const shouldBeTransparent = isHome && !isScrolled;
  const safeFavoritesCount = hasMounted ? favorites.length : 0;
  const safeItemCount = hasMounted ? itemCount : 0;
  const safeIsAuthenticated = hasMounted ? isAuthenticated : false;
  const safeUser = hasMounted ? user : null;

  const textClass = shouldBeTransparent
    ? "text-[#efe7dc]"
    : "text-[#1c1a18] hover:text-[#b5573a]";

  const logoStyle = shouldBeTransparent
    ? { filter: "brightness(0) invert(1)" }
    : { filter: "brightness(0.15)" };

  const iconClass = shouldBeTransparent
    ? "text-[#efe7dc] hover:text-[#ffb59f]"
    : "text-[#1c1a18] hover:text-[#b5573a]";

  // Layout changes: fixed on home page (transparent or pill), flat full-bleed on other pages
  const headerClass = isHome
    ? `fixed top-0 inset-x-0 z-50 flex justify-center px-4 md:px-8 transition-all duration-500 ${
        isScrolled ? "py-4" : "py-8"
      }`
    : "fixed top-0 inset-x-0 z-50 h-[72px] w-full overflow-visible bg-[#f7f4ef] flex items-center will-change-transform";

  const innerClass = isHome
    ? isScrolled
      ? "w-full max-w-[1800px] flex items-center justify-between rounded-full bg-white/20 border border-white/30 shadow-[0_12px_40px_rgba(28,26,24,0.06)] px-6 py-3 transition-all duration-500"
      : "w-full max-w-[1800px] flex items-center justify-between rounded-none bg-transparent border-b border-transparent px-4 md:px-8 py-2 transition-all duration-500"
      : "w-full max-w-[1800px] h-full flex items-center justify-between px-6 md:px-16 mx-auto";

  const burgerClass = shouldBeTransparent
    ? "text-[#efe7dc] hover:text-[#ffb59f]"
    : "text-[#1c1a18] hover:text-[#b5573a]";

  const searchBgClass = shouldBeTransparent ? "bg-white/10" : "bg-[#efe7dc]/80";

  const searchInputClass = shouldBeTransparent
    ? "text-[#efe7dc] placeholder-[#efe7dc]/50"
    : "text-[#1c1a18] placeholder-[#1c1a18]/50";

  const persistSearchHistory = (term: string) => {
    const normalized = term.trim();
    if (!normalized) return;

    setSearchHistory((prev) => {
      const next = [normalized, ...prev.filter((item) => item.toLowerCase() !== normalized.toLowerCase())].slice(
        0,
        MAX_SEARCH_HISTORY_ITEMS
      );
      return next;
    });
  };

  const removeSearchHistoryItem = (term: string) => {
    const target = term.trim().toLowerCase();
    if (!target) return;

    setSearchHistory((prev) => prev.filter((item) => item.toLowerCase() !== target));
  };

  const runSearch = (term: string) => {
    const normalized = term.trim();
    if (!normalized) return;

    persistSearchHistory(normalized);
    router.push(`/search?q=${encodeURIComponent(normalized)}`);
    setIsMobileMenuOpen(false);
    setIsSearchSuggestionsOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch(searchQuery);
  };

  const navigationItems = [
    {
      label: "Sale",
      href: "/sale",
      featuredTitle: "Chương Trình Giảm Giá",
      featuredDesc: "Giá ưu đãi được cập nhật trực tiếp từ campaign đang hoạt động.",
      subItems: [
        { label: "Standard Sale", href: "/sale" },
        { label: "Flash Sale", href: "/flash-sale" },
      ],
    },
    {
      label: "Collection",
      href: "/collection",
      featuredTitle: "Mùa Hè 2026",
      featuredDesc: "Tập trung vào phom dáng tối giản và các chất liệu tự nhiên như linen, organic cotton.",
      subItems: [
        { label: "New Arrivals", href: "/collection" },
        { label: "Artisan Linen", href: "/collection" },
        { label: "Minimalist Tailoring", href: "/collection" },
        { label: "Heritage Wool", href: "/collection" },
      ],
    },
    {
      label: "Quần",
      href: "/collection",
      featuredTitle: "Chất Liệu Bền Vững",
      featuredDesc: "Các thiết kế quần âu xếp ly tinh tế và quần relaxed thoải mái cho mọi hoạt động.",
      subItems: [
        { label: "Quần Tây Ly Xếp", href: "/collection" },
        { label: "Quần Âu Slim-fit", href: "/collection" },
        { label: "Quần Trousers Relaxed", href: "/collection" },
        { label: "Quần Shorts Linen", href: "/collection" },
      ],
    },
    {
      label: "Áo",
      href: "/collection",
      featuredTitle: "Phom Dáng Phóng Khoáng",
      featuredDesc: "Từ những chiếc áo thun signature chất dày dặn đến áo sơ mi linen bay bổng.",
      subItems: [
        { label: "Áo Thun Signature", href: "/collection" },
        { label: "Áo Sơ Mi Linen", href: "/collection" },
        { label: "Áo Blazer Lịch Lãm", href: "/collection" },
        { label: "Áo Khoác Nhẹ", href: "/collection" },
      ],
    },
    {
      label: "Phụ kiện",
      href: "/collection",
      featuredTitle: "Chi Tiết Hoàn Thiện",
      featuredDesc: "Điểm nhấn tinh tế từ túi tote heritage vải canvas dày đến các phụ kiện da cao cấp.",
      subItems: [
        { label: "Túi Canvas Heritage", href: "/collection" },
        { label: "Thắt Lưng Da", href: "/collection" },
        { label: "Ví Cầm Tay", href: "/collection" },
        { label: "Mũ Vải Tối Giản", href: "/collection" },
      ],
    },
    {
      label: "Help",
      href: "/help",
    },
  ];

  return (
    <>
      <motion.header
        initial={{ y: isHome ? -120 : -72 }}
        animate={{ y: showHeader ? 0 : (isHome ? -120 : -72) }}
        transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
        className={headerClass}
      >
        {!isHome && <div aria-hidden="true" className="absolute inset-0 bg-[var(--background)]" />}
        <div
          className={`${innerClass} relative z-10`}
          style={
            isHome && isScrolled
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
                <Image
                  src="/images/brand/vela-wear-logo.png"
                  alt="Vela Wear Logo"
                  width={512}
                  height={512}
                  style={logoStyle}
                  className="h-8 md:h-9 w-auto object-contain"
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

          {/* Desktop Navigation Menu */}
          <NavigationMenu className="hidden md:flex max-w-none flex-1 justify-start">
            <NavigationMenuList className="gap-3 pl-3">
              {navigationItems.map((item) => (
                <NavigationMenuItem key={item.label}>
                  {item.subItems ? (
                    <>
                      <NavigationMenuTrigger
                        className={`group/link relative bg-transparent px-2.5 text-sm font-medium tracking-[0.5px] ${textClass} transition-colors border-none cursor-pointer flex items-center gap-1`}
                      >
                        <span className="relative inline-flex items-center gap-1">
                          <span className="relative pb-0.5">
                            {item.label}
                            <span className="absolute bottom-[-1px] left-0 h-[1.5px] w-full origin-left scale-x-0 bg-[#b5573a] transition-transform duration-300 ease-out group-hover/link:scale-x-100" />
                          </span>
                        </span>
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <div className="flex w-[800px] gap-10 p-8">
                          <div className="flex w-1/3 flex-col justify-between p-2">
                            <div>
                              <p className="text-[10px] uppercase tracking-[0.22em] text-[#1c1a18]/50 font-semibold">Vela Wear</p>
                              <p className="mt-4 text-2xl font-medium text-[#1c1a18] leading-tight">{item.featuredTitle}</p>
                              <p className="mt-3 text-sm leading-6 text-[#1c1a18]/70">{item.featuredDesc}</p>
                            </div>
                            <BaseNavigationMenu.Link
                              render={<Link href={item.href} onClick={() => {
                                if (document.activeElement instanceof HTMLElement) {
                                  document.activeElement.blur();
                                }
                              }} />}
                              className="mt-6 text-xs font-semibold uppercase tracking-wider text-[#b5573a] hover:text-[#964025] transition-colors inline-flex items-center gap-1 group/btn"
                            >
                              Khám phá tất cả <span className="transition-transform duration-300 ease-out group-hover/btn:translate-x-1">&rarr;</span>
                            </BaseNavigationMenu.Link>
                          </div>
                          <div className="grid flex-1 grid-cols-2 gap-x-6 gap-y-2">
                            {item.subItems.map((sub) => (
                              <NavigationMenuLink
                                key={sub.label}
                                render={<Link href={sub.href} onClick={() => {
                                  setIsMobileMenuOpen(false);
                                  if (document.activeElement instanceof HTMLElement) {
                                    document.activeElement.blur();
                                  }
                                }} />}
                                className="group/item flex flex-col justify-center rounded-xl p-4 transition-all duration-300 hover:bg-white/60 hover:shadow-[0_4px_12px_rgba(28,26,24,0.03)]"
                              >
                                <p className="text-sm font-medium text-[#1c1a18] transition-colors group-hover/item:text-[#b5573a]">{sub.label}</p>
                                <p className="mt-1.5 text-xs leading-5 text-[#1c1a18]/55">Khám phá bộ sưu tập</p>
                              </NavigationMenuLink>
                            ))}
                          </div>
                        </div>
                      </NavigationMenuContent>
                    </>
                  ) : (
                    <NavigationMenuLink
                      render={<Link href={item.href} onClick={() => {
                        if (document.activeElement instanceof HTMLElement) {
                          document.activeElement.blur();
                        }
                      }} />}
                      className={navigationMenuTriggerStyle()}
                    >
                      <span className={`relative inline-flex items-center ${textClass} group/link`}>
                        <span className="relative pb-0.5">
                          {item.label}
                          <span className="absolute bottom-[-1px] left-0 h-[1.5px] w-full origin-left scale-x-0 bg-[#b5573a] transition-transform duration-300 ease-out group-hover/link:scale-x-100" />
                        </span>
                      </span>
                    </NavigationMenuLink>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Right side items */}
          <div className="flex items-center gap-4 md:gap-6">
            {/* Desktop Search bar */}
            <div ref={searchBoxRef} className="relative hidden lg:block w-52 focus-within:w-68 transition-all duration-300">
              <form
                onSubmit={handleSearchSubmit}
                className={`flex items-center ${searchBgClass} rounded-full px-4 py-2 gap-2.5 w-full border border-transparent focus-within:border-[#b5573a]/20`}
              >
                <button type="submit" aria-label="Search" className="cursor-pointer focus:outline-none border-none p-0 bg-transparent flex items-center justify-center">
                  <Search className={`w-4 h-4 ${shouldBeTransparent ? "text-[#efe7dc]/80" : "text-[#8a857c]"}`} />
                </button>
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={searchQuery}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchSuggestionsOpen(true);
                  }}
                  onFocus={() => setIsSearchSuggestionsOpen(true)}
                  className={`bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-xs w-full ${searchInputClass}`}
                />
              </form>

              <AnimatePresence>
                {isSearchSuggestionsOpen && (searchQuery.trim() || searchHistory.length > 0) && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.18 }}
                    className="absolute left-0 right-0 mt-3 overflow-hidden rounded-[20px] border border-[#1c1a18]/10 bg-[#f7f4ef] shadow-[0_6px_18px_rgba(28,26,24,0.06)] z-50"
                  >
                    {searchQuery.trim() ? (
                      <>
                        <div className="px-4 py-3 border-b border-[#1c1a18]/10">
                          <p className="text-[10px] uppercase tracking-[0.18em] text-[#1c1a18]/50">
                            Gợi ý tìm kiếm
                          </p>
                        </div>
                        <div className="max-h-96 overflow-auto">
                          {searchSuggestions.length > 0 ? (
                            searchSuggestions.map((product) => (
                              <Link
                                key={product.id}
                                href={`/products/${product.id}`}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-[#efe7dc] transition-colors border-b border-[#1c1a18]/5 last:border-b-0"
                                onClick={() => {
                                  persistSearchHistory(searchQuery);
                                  setIsSearchSuggestionsOpen(false);
                                }}
                              >
                                <Image
                                  src={product.image}
                                  alt={product.name}
                                  width={56}
                                  height={56}
                                  className="h-14 w-14 rounded-lg object-cover bg-white"
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-medium text-[#1c1a18]">
                                    {product.name}
                                  </p>
                                  <p className="truncate text-xs text-[#1c1a18]/55">
                                    {product.category}
                                  </p>
                                  <p className="mt-1 text-xs font-semibold text-[#b5573a] font-numeric">
                                    {money(product.price)}
                                  </p>
                                </div>
                              </Link>
                            ))
                          ) : (
                            <div className="px-4 py-6 text-sm text-[#1c1a18]/60">
                              Không tìm thấy sản phẩm phù hợp.
                            </div>
                          )}
                        </div>
                        <div className="border-t border-[#1c1a18]/10 px-4 py-3">
                          <button
                            type="button"
                            onClick={() => runSearch(searchQuery)}
                            className="w-full rounded-full border border-[#1c1a18]/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#1c1a18] hover:bg-[#1c1a18] hover:text-white transition-colors"
                          >
                            Xem thêm kết quả
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="px-4 py-3 border-b border-[#1c1a18]/10 flex items-center justify-between gap-3">
                          <p className="text-[10px] uppercase tracking-[0.18em] text-[#1c1a18]/50">
                            Lịch sử tìm kiếm gần đây
                          </p>
                          {searchHistory.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setSearchHistory([])}
                              className="text-[10px] uppercase tracking-[0.16em] text-[#1c1a18]/40 hover:text-[#1c1a18]"
                            >
                              Xóa
                            </button>
                          )}
                        </div>
                        <div className="max-h-96 overflow-auto p-3">
                          <div className="flex flex-wrap gap-2">
                            {searchHistory.map((term) => (
                              <div
                                key={term}
                                className="inline-flex items-center gap-1 rounded-full border border-[#1c1a18]/10 bg-white px-3 py-2 text-xs text-[#1c1a18] hover:bg-[#efe7dc] transition-colors"
                              >
                                <button
                                  type="button"
                                  onClick={() => runSearch(term)}
                                  className="max-w-[150px] truncate text-left"
                                  title={term}
                                >
                                  {term}
                                </button>
                                <button
                                  type="button"
                                  aria-label={`Xóa ${term}`}
                                  onClick={() => removeSearchHistoryItem(term)}
                                  className="grid size-4 place-items-center rounded-full text-[#1c1a18]/45 transition-colors hover:bg-[#1c1a18] hover:text-white"
                                >
                                  <span className="text-[10px] leading-none">×</span>
                                </button>
                              </div>
                            ))}
                          </div>
                          {searchHistory.length === 0 && (
                            <div className="px-1 py-3 text-sm text-[#1c1a18]/60">
                              Chưa có lịch sử tìm kiếm.
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

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
                  {safeFavoritesCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-0 right-0 w-4.5 h-4.5 rounded-full bg-[#b5573a] text-white text-[9px] font-bold flex items-center justify-center border border-[#f7f4ef]"
                    >
                      {safeFavoritesCount}
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
                  {safeItemCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-0 right-0 w-4.5 h-4.5 rounded-full bg-[#b5573a] text-white text-[9px] font-bold flex items-center justify-center border border-[#f7f4ef]"
                    >
                      {safeItemCount}
                    </motion.span>
                  )}
                </motion.button>
              </Link>

              {/* Account Profile / Login */}
              <div className="hidden md:flex items-center gap-4">
                {safeIsAuthenticated && safeUser ? (
                  <div className="relative group">
                    <Link
                      href="/profile"
                      aria-label="View Profile"
                      className={`flex size-8 items-center justify-center rounded-full border border-hairline bg-[#efe7dc] text-[#1c1a18] text-xs font-semibold group-hover:bg-[#b5573a] group-hover:text-white group-hover:border-[#b5573a] transition-all duration-300 flex-shrink-0 cursor-pointer`}
                    >
                      {safeUser.fullName
                        ? safeUser.fullName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .substring(0, 2)
                            .toUpperCase()
                        : "U"}
                    </Link>

                    {/* Invisible bridge to keep hover state active */}
                    <div className="absolute right-0 top-8 h-4 w-32 bg-transparent" />
                    
                    {/* Dropdown Menu */}
                    <div className="absolute right-0 top-12 w-40 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 bg-[#f7f4ef] rounded-[16px] border border-[#1c1a18]/10 shadow-[0_4px_16px_rgba(28,26,24,0.06)] overflow-hidden">
                      <div className="px-4 py-2.5 border-b border-[#1c1a18]/10">
                        <span className="font-sans text-sm font-semibold text-[#1c1a18]">Account</span>
                      </div>
                      <div className="flex flex-col py-1">
                        <Link href="/profile" className="px-4 py-1.5 text-[13px] font-medium text-[#1c1a18]/75 hover:text-[#b5573a] hover:bg-[#efe7dc]/50 transition-colors">Profile</Link>
                        <Link href="/profile?tab=orders" className="px-4 py-1.5 text-[13px] font-medium text-[#1c1a18]/75 hover:text-[#b5573a] hover:bg-[#efe7dc]/50 transition-colors">Orders</Link>
                        <Link href="/favorites" className="px-4 py-1.5 text-[13px] font-medium text-[#1c1a18]/75 hover:text-[#b5573a] hover:bg-[#efe7dc]/50 transition-colors">Favourites</Link>
                        <Link href="/profile?tab=coupons" className="px-4 py-1.5 text-[13px] font-medium text-[#1c1a18]/75 hover:text-[#b5573a] hover:bg-[#efe7dc]/50 transition-colors">Coupons</Link>
                        <Link href="/profile?tab=reviews" className="px-4 py-1.5 text-[13px] font-medium text-[#1c1a18]/75 hover:text-[#b5573a] hover:bg-[#efe7dc]/50 transition-colors">Reviews</Link>
                        <button onClick={() => { signOut(); router.push("/"); }} className="px-4 py-1.5 text-[13px] font-medium text-[#1c1a18]/75 hover:text-[#b5573a] hover:bg-[#efe7dc]/50 transition-colors text-left w-full cursor-pointer">Log Out</button>
                      </div>
                    </div>
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
              {navigationItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="font-serif text-2xl text-[#1c1a18] hover:text-[#b5573a] transition-colors"
                >
                  {item.label}
                </Link>
              ))}
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
              {safeIsAuthenticated && safeUser ? (
                <div className="flex flex-col gap-4">
                  <Link
                    href="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-sm font-semibold uppercase tracking-[1px] text-[#1c1a18] text-center bg-[#efe7dc] py-4 rounded-[6px] hover:bg-[#b5573a] hover:text-white transition-colors duration-300"
                  >
                    View Profile ({safeUser.fullName})
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
    </>
  );
}
