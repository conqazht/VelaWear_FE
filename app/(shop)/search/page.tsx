"use client";

import { Suspense, useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronDown, ChevronUp, SlidersHorizontal, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Product, mapBackendProduct } from "@/lib/vela-data";
import { ProductCard } from "@/components/shop/product-card";
import { getProducts } from "@/lib/api/catalog";
import { getActiveLocale } from "@/lib/i18n";
import { matchesSearchText, normalizeSearchText } from "@/lib/search";
import { cn } from "@/lib/utils";

const getNormalizedCategoryKey = (cat: string): string => {
  const c = cat.toLowerCase();
  if (c === "ao" || c.includes("áo") || c.includes("shirt") || c.includes("top")) return "AO";
  if (c === "quan" || c.includes("quần") || c.includes("trouser") || c.includes("pant") || c.includes("bottom")) return "QUAN";
  return "PHU KIEN";
};

const categoryDisplayNames: Record<string, string> = {
  AO: "Shirts & Tops",
  QUAN: "Trousers & Bottoms",
  "PHU KIEN": "Accessories",
};

interface FilterGroupsProps {
  selectedCategories: string[];
  selectedSizes: string[];
  selectedColors: string[];
  categoryCounts: Record<string, number>;
  sizesToDisplay: string[];
  colorsToDisplay: { name: string; hex: string }[];
  expandedSections: { category: boolean; size: boolean; color: boolean };
  handleCategoryToggle: (category: string) => void;
  handleSizeToggle: (size: string) => void;
  handleColorToggle: (color: string) => void;
  toggleSection: (section: "category" | "size" | "color") => void;
  clearAllFilters: () => void;
  hasActiveFilters: boolean;
  isMobile?: boolean;
}

function FilterGroups({
  selectedCategories,
  selectedSizes,
  selectedColors,
  categoryCounts,
  sizesToDisplay,
  colorsToDisplay,
  expandedSections,
  handleCategoryToggle,
  handleSizeToggle,
  handleColorToggle,
  toggleSection,
  clearAllFilters,
  hasActiveFilters,
  isMobile = false,
}: FilterGroupsProps) {
  return (
    <div className="space-y-8">
      {/* Category Section */}
      <div className="border-b border-[#1c1a18]/10 pb-6">
        <button
          type="button"
          onClick={() => toggleSection("category")}
          className="w-full text-left font-sans text-xs font-semibold uppercase tracking-[0.15em] text-[#1c1a18] flex justify-between items-center select-none cursor-pointer"
        >
          <span>Category</span>
          {expandedSections.category ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </button>
        <AnimatePresence initial={false}>
          {expandedSections.category && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-4 space-y-3 text-sm text-[#1c1a18]/70">
                {Object.entries(categoryDisplayNames).map(([key, label]) => {
                  const isChecked = selectedCategories.includes(key);
                  const count = categoryCounts[key] || 0;
                  return (
                    <label key={key} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleCategoryToggle(key)}
                          className="peer appearance-none h-4 w-4 border border-[#1c1a18]/25 rounded-none bg-canvas checked:bg-[#1c1a18] checked:border-[#1c1a18] cursor-pointer transition-colors"
                        />
                        <Check className="absolute size-3 text-[#f7f4ef] opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                      </div>
                      <span className="group-hover:text-[#1c1a18] transition-colors">
                        {label} {count > 0 && `(${count})`}
                      </span>
                    </label>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Size Section */}
      <div className="border-b border-[#1c1a18]/10 pb-6">
        <button
          type="button"
          onClick={() => toggleSection("size")}
          className="w-full text-left font-sans text-xs font-semibold uppercase tracking-[0.15em] text-[#1c1a18] flex justify-between items-center select-none cursor-pointer"
        >
          <span>Size</span>
          {expandedSections.size ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </button>
        <AnimatePresence initial={false}>
          {expandedSections.size && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-4 grid grid-cols-3 gap-2">
                {sizesToDisplay.map((size) => {
                  const isSelected = selectedSizes.includes(size);
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleSizeToggle(size)}
                      className={cn(
                        "py-2 text-center text-xs font-medium border rounded-none transition-all cursor-pointer",
                        isSelected
                          ? "border-[#1c1a18] bg-[#efe7dc] text-[#1c1a18]"
                          : "border-[#1c1a18]/10 hover:border-[#1c1a18] text-[#1c1a18]/70 bg-transparent"
                      )}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Color Section */}
      <div className="border-b border-[#1c1a18]/10 pb-6">
        <button
          type="button"
          onClick={() => toggleSection("color")}
          className="w-full text-left font-sans text-xs font-semibold uppercase tracking-[0.15em] text-[#1c1a18] flex justify-between items-center select-none cursor-pointer"
        >
          <span>Color</span>
          {expandedSections.color ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </button>
        <AnimatePresence initial={false}>
          {expandedSections.color && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-4 flex flex-wrap gap-3">
                {colorsToDisplay.map(({ name, hex }) => {
                  const isSelected = selectedColors.includes(name);
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => handleColorToggle(name)}
                      title={name}
                      style={{ backgroundColor: hex }}
                      className={cn(
                        "w-8 h-8 rounded-none border border-[#1c1a18]/10 shadow-sm transition-all cursor-pointer relative",
                        isSelected
                          ? "ring-2 ring-offset-2 ring-[#1c1a18] ring-offset-[#f7f4ef]"
                          : "hover:scale-105"
                      )}
                    >
                      {name === "White" && (
                        <div className="absolute inset-0 border border-[#1c1a18]/5 rounded-none pointer-events-none" />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Clear Filters Button (Only shown on Desktop Sidebar; Mobile handles it at drawer bottom) */}
      {!isMobile && hasActiveFilters && (
        <button
          type="button"
          onClick={clearAllFilters}
          className="w-full py-2.5 border border-[#b5573a] text-[#b5573a] hover:bg-[#b5573a] hover:text-white transition-colors text-xs font-semibold uppercase tracking-wider rounded-none cursor-pointer"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
}

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("Recommended");

  // Sidebar Toggles
  const [showFilters, setShowFilters] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Section Collapsibles
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    size: true,
    color: true,
  });

  const activeLocale = getActiveLocale();

  // Load catalog products once per locale, then filter locally for accent-insensitive search
  useEffect(() => {
    async function loadCatalog() {
      setIsLoading(true);
      try {
        const data = await getProducts({
          size: 500,
          locale: activeLocale,
        });
        const mapped = (data.result || []).map((p: Parameters<typeof mapBackendProduct>[0]) =>
          mapBackendProduct(p, activeLocale)
        );
        setCatalogProducts(mapped);
      } catch (err) {
        console.error("Failed to load catalog for search", err);
        setCatalogProducts([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadCatalog();
  }, [activeLocale]);

  const filteredCatalog = useMemo(() => {
    const normalizedQuery = normalizeSearchText(query);
    if (!normalizedQuery) return catalogProducts;

    return catalogProducts.filter((product) => {
      const searchable = [product.name, product.category, product.id, product.description]
        .filter(Boolean)
        .join(" ");
      return matchesSearchText(searchable, normalizedQuery);
    });
  }, [catalogProducts, query]);

  const products = filteredCatalog;

  // Derived filter configurations
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { AO: 0, QUAN: 0, "PHU KIEN": 0 };
    products.forEach((p) => {
      const norm = getNormalizedCategoryKey(p.category);
      if (norm in counts) {
        counts[norm]++;
      }
    });
    return counts;
  }, [products]);

  const availableSizes = useMemo(() => {
    const sizesSet = new Set<string>();
    products.forEach((p) => {
      if (p.size) {
        p.size.split(",").forEach((s) => {
          const trimmed = s.trim();
          if (trimmed) sizesSet.add(trimmed);
        });
      }
    });
    const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "One Size"];
    return Array.from(sizesSet).sort((a, b) => {
      const idxA = sizeOrder.indexOf(a);
      const idxB = sizeOrder.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [products]);

  const availableColors = useMemo(() => {
    const colorsMap = new Map<string, string>();
    const colorHexMap: Record<string, string> = {
      black: "#1c1a18",
      white: "#ffffff",
      sand: "#e0d7c6",
      cream: "#fdfbf7",
      terracotta: "#c97a63",
      espresso: "#503c33",
      natural: "#ebe6dd",
      sage: "#a3b899",
      olive: "#5c6b53",
      grey: "#707070",
      charcoal: "#4a4a4a",
      brown: "#8b5a2b",
      beige: "#f5f5dc",
      mustard: "#e1ad01",
      rust: "#b7410e",
      blue: "#4a6b82",
    };

    products.forEach((p) => {
      if (p.color) {
        const name = p.color.trim();
        const lower = name.toLowerCase();
        const hex = colorHexMap[lower] || "#cccccc";
        colorsMap.set(name, hex);
      }
    });

    return Array.from(colorsMap.entries()).map(([name, hex]) => ({ name, hex }));
  }, [products]);

  // Fallbacks if data is sparse
  const sizesToDisplay = availableSizes.length > 0 ? availableSizes : ["XS", "S", "M", "L", "XL"];
  const colorsToDisplay = availableColors.length > 0 ? availableColors : [
    { name: "Black", hex: "#1c1a18" },
    { name: "White", hex: "#ffffff" },
    { name: "Sand", hex: "#e0d7c6" },
    { name: "Terracotta", hex: "#c97a63" },
    { name: "Sage", hex: "#a3b899" }
  ];

  // Dynamic filter processing
  const filteredProducts = useMemo(() => {
    let results = products;

    // 1. Text Search fallback (extra client-side validation)
    if (query.trim()) {
      const q = normalizeSearchText(query);
      results = results.filter(
        (p) =>
          matchesSearchText(p.name, q) ||
          matchesSearchText(p.description, q) ||
          matchesSearchText(p.category, q) ||
          matchesSearchText(p.color, q)
      );
    }

    // 2. Category Filter
    if (selectedCategories.length > 0) {
      results = results.filter((p) => {
        const norm = getNormalizedCategoryKey(p.category);
        return selectedCategories.includes(norm);
      });
    }

    // 3. Size Filter
    if (selectedSizes.length > 0) {
      results = results.filter((p) => {
        const pSizes = p.size.split(",").map((s) => s.trim());
        return selectedSizes.some((sz) => pSizes.includes(sz));
      });
    }

    // 4. Color Filter
    if (selectedColors.length > 0) {
      results = results.filter((p) => {
        return selectedColors.some((col) => col.toLowerCase() === p.color.toLowerCase());
      });
    }

    // 5. Sort
    if (sortBy === "PriceLowToHigh") {
      results = [...results].sort((a, b) => a.price - b.price);
    } else if (sortBy === "PriceHighToLow") {
      results = [...results].sort((a, b) => b.price - a.price);
    } else if (sortBy === "Newest") {
      results = [...results].reverse();
    }

    return results;
  }, [products, query, selectedCategories, selectedSizes, selectedColors, sortBy]);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const handleSizeToggle = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleColorToggle = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const toggleSection = (section: "category" | "size" | "color") => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const hasActiveFilters = selectedCategories.length > 0 || selectedSizes.length > 0 || selectedColors.length > 0;

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedSizes([]);
    setSelectedColors([]);
  };

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-[1800px] px-6 py-32 text-center select-none">
        <span className="text-xs uppercase tracking-widest text-[#1c1a18]/50">Searching products...</span>
      </div>
    );
  }

  const filterProps = {
    selectedCategories,
    selectedSizes,
    selectedColors,
    categoryCounts,
    sizesToDisplay,
    colorsToDisplay,
    expandedSections,
    handleCategoryToggle,
    handleSizeToggle,
    handleColorToggle,
    toggleSection,
    clearAllFilters,
    hasActiveFilters,
  };

  return (
    <div className="mx-auto w-full max-w-[1800px] px-6 py-12 md:px-16">
      {/* Breadcrumbs */}
      <div className="mb-6 flex gap-2 text-[10px] uppercase tracking-[0.15em] text-[#1c1a18]/50">
        <Link href="/" className="hover:text-[#1c1a18]">
          Home
        </Link>
        <span>/</span>
        <span className="font-medium text-[#1c1a18]">Search</span>
      </div>

      {/* Search Header */}
      <header className="mb-4">
        <h1 className="font-serif text-3xl font-light tracking-wide text-[#1c1a18] md:text-5xl">
          Results for &ldquo;{query}&rdquo;
        </h1>
      </header>

      {/* Toolbar */}
      <div className="sticky top-[var(--header-visible-height)] z-30 isolate mb-6 flex flex-col gap-3 py-3 transition-[top] duration-[220ms] ease-[cubic-bezier(0.23,1,0.32,1)] before:absolute before:inset-y-0 before:-left-[100vw] before:-right-[100vw] before:-z-10 before:bg-[#f7f4ef] md:flex-row md:items-center md:justify-between">
        <div className="relative z-10 flex items-center gap-4">
          <p className="hidden text-xs uppercase tracking-widest text-[#1c1a18]/60 md:block">
            Showing {filteredProducts.length} products
          </p>
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="md:hidden flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1c1a18] border border-[#1c1a18]/15 px-3 py-1.5 rounded-none bg-transparent hover:bg-[#1c1a18]/5 cursor-pointer"
          >
            <span>Filter</span>
            <SlidersHorizontal className="size-3.5" />
          </button>
        </div>

        <div className="relative z-10 flex items-center gap-4 md:gap-6">
          {/* Hide/Show Filters Desktop Button */}
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="hidden md:flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1c1a18] hover:text-[#b5573a] transition-colors cursor-pointer"
          >
            <span>{showFilters ? "Hide Filters" : "Show Filters"}</span>
            <SlidersHorizontal className="size-3.5" />
          </button>

          {/* Premium Sort Dropdown */}
          <div className="flex items-center gap-1 cursor-pointer group relative">
            <span className="text-xs uppercase tracking-widest text-[#1c1a18]/50">Sort By:</span>
            <div className="relative flex items-center">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-transparent border-none text-[#1c1a18] text-xs font-semibold uppercase tracking-wider p-0 pr-6 focus:ring-0 cursor-pointer font-medium opacity-0 absolute inset-0 w-full h-full z-10"
              >
                <option value="Recommended">Recommended</option>
                <option value="Newest">Newest</option>
                <option value="PriceLowToHigh">Price: Low to High</option>
                <option value="PriceHighToLow">Price: High to Low</option>
              </select>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#1c1a18]">
                {sortBy === "Recommended" && "Recommended"}
                {sortBy === "Newest" && "Newest"}
                {sortBy === "PriceLowToHigh" && "Price: Low to High"}
                {sortBy === "PriceHighToLow" && "Price: High to Low"}
              </span>
              <ChevronDown className="size-3.5 text-[#1c1a18] ml-1 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col gap-12 md:flex-row items-start">
        {/* Desktop Sidebar Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 256, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="hidden md:block w-64 shrink-0 overflow-hidden pr-8 sticky top-[calc(var(--header-visible-height)+60px)] transition-[top] duration-[220ms] ease-[cubic-bezier(0.23,1,0.32,1)]"
            >
              <FilterGroups {...filterProps} />
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Results Grid */}
        <div className="flex-grow w-full">
          {filteredProducts.length === 0 ? (
            <div className="py-20 text-center select-none">
              <p className="text-sm text-[#1c1a18]/50 mb-6">
                Không tìm thấy sản phẩm phù hợp với từ khóa của bạn.
              </p>
              <Link
                href="/collection"
                className="inline-flex items-center rounded-none bg-[#1c1a18] px-8 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-[#b5573a]"
              >
                Xem tất cả sản phẩm
              </Link>
            </div>
          ) : (
            <motion.div
              layout
              className={cn(
                "grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 w-full transition-all duration-300",
                showFilters ? "lg:grid-cols-3" : "lg:grid-cols-4"
              )}
            >
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFiltersOpen(false)}
              className="fixed inset-0 bg-black/45 z-50 md:hidden"
            />
            {/* Drawer Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed right-0 top-0 h-full w-[85vw] max-w-sm bg-[#f7f4ef] z-50 p-6 overflow-y-auto flex flex-col shadow-2xl md:hidden"
            >
              <div className="flex items-center justify-between border-b border-[#1c1a18]/10 pb-4 mb-6">
                <h2 className="font-serif text-2xl font-light text-[#1c1a18]">Bộ lọc</h2>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-1 hover:text-[#b5573a] transition-colors cursor-pointer"
                >
                  <X className="size-6" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto pr-1">
                <FilterGroups {...filterProps} isMobile={true} />
              </div>

              <div className="border-t border-[#1c1a18]/10 pt-4 mt-6 flex gap-4">
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="flex-1 py-3 border border-[#1c1a18] text-[#1c1a18] text-xs font-semibold uppercase tracking-wider transition-colors hover:bg-[#1c1a18]/5 rounded-none cursor-pointer"
                >
                  Xóa tất cả
                </button>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="flex-1 py-3 bg-[#1c1a18] text-white text-xs font-semibold uppercase tracking-wider transition-colors hover:bg-[#b5573a] rounded-none cursor-pointer"
                >
                  Áp dụng
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto w-full max-w-[1800px] px-6 py-20 text-center text-xs uppercase tracking-widest text-[#1c1a18]/50">
        Loading Search Results...
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  );
}
