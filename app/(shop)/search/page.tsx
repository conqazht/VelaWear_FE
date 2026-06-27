"use client";

import { Suspense, useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Product, mapBackendProduct } from "@/lib/vela-data";
import { ProductCard } from "@/components/shop/product-card";
import apiClient from "@/lib/api-client";

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters state
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("Recommended");

  // Fetch search results from backend on mount and query changes
  useEffect(() => {
    async function searchProducts() {
      setIsLoading(true);
      try {
        const response = await apiClient.get(`/products?name=${encodeURIComponent(query)}&size=100`);
        if (response.data?.data?.result) {
          const mapped = response.data.data.result.map((p: Parameters<typeof mapBackendProduct>[0]) => mapBackendProduct(p));
          setProducts(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch search results from backend", err);
      } finally {
        setIsLoading(false);
      }
    }
    searchProducts();
  }, [query]);

  // Filter and search logic
  const filteredProducts = useMemo(() => {
    let results = products;

    // 1. Text Search query (fallback client-side filter to be extra safe)
    if (query.trim()) {
      const q = query.toLowerCase();
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.color.toLowerCase().includes(q)
      );
    }

    // 2. Category Filter
    if (selectedCategories.length > 0) {
      results = results.filter((p) => selectedCategories.includes(p.category));
    }

    // 3. Size Filter
    if (selectedSizes.length > 0) {
      results = results.filter((p) => selectedSizes.includes(p.size));
    }

    // 4. Sort
    if (sortBy === "PriceLowToHigh") {
      results = [...results].sort((a, b) => a.price - b.price);
    } else if (sortBy === "PriceHighToLow") {
      results = [...results].sort((a, b) => b.price - a.price);
    } else if (sortBy === "Newest") {
      results = [...results].reverse();
    }

    return results;
  }, [products, query, selectedCategories, selectedSizes, sortBy]);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleSizeToggle = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-[1800px] px-6 py-32 text-center select-none">
        <span className="text-xs uppercase tracking-widest text-[#1c1a18]/50">Searching products...</span>
      </div>
    );
  }

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
      <header className="mb-12 flex flex-col justify-between items-baseline gap-4 border-b border-[#1c1a18]/10 pb-8 md:flex-row">
        <div>
          <h1 className="font-serif text-3xl font-light tracking-wide text-[#1c1a18] md:text-5xl">
            Results for &ldquo;{query}&rdquo;
          </h1>
          <p className="mt-2 text-xs uppercase tracking-widest text-[#1c1a18]/60">
            Showing {filteredProducts.length} products
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Sort Select */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-transparent border border-[#1c1a18]/15 text-[#1c1a18] text-xs font-semibold uppercase tracking-wider py-2 pl-4 pr-10 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#b5573a] cursor-pointer"
            >
              <option value="Recommended">Recommended</option>
              <option value="Newest">Newest</option>
              <option value="PriceLowToHigh">Price: Low to High</option>
              <option value="PriceHighToLow">Price: High to Low</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none size-4 text-[#1c1a18]/60" />
          </div>
        </div>
      </header>

      {/* Content Body */}
      <div className="flex flex-col gap-12 md:flex-row">
        {/* Sidebar Filters */}
        <aside className="w-full shrink-0 md:w-64">
          <div className="sticky top-28 space-y-8">
            {/* Category Filter */}
            <div className="border-b border-[#1c1a18]/10 pb-6">
              <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.15em] text-[#1c1a18] mb-4">
                Category
              </h3>
              <div className="space-y-3 text-sm text-[#1c1a18]/70">
                {[
                  { key: "AO", label: "Shirts & Tops" },
                  { key: "QUAN", label: "Trousers & Bottoms" },
                  { key: "PHU KIEN", label: "Accessories" },
                ].map((cat) => (
                  <label
                    key={cat.key}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat.key)}
                      onChange={() => handleCategoryToggle(cat.key)}
                      className="h-4 w-4 border-[#e3dccf] text-[#b5573a] focus:ring-[#b5573a]/30 rounded-sm cursor-pointer"
                    />
                    <span className="group-hover:text-[#1c1a18] transition-colors">
                      {cat.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Size Filter */}
            <div className="border-b border-[#1c1a18]/10 pb-6">
              <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.15em] text-[#1c1a18] mb-4">
                Size
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {["S", "M", "L", "XL", "OS"].map((size) => {
                  const isSelected = selectedSizes.includes(size);
                  return (
                    <button
                      key={size}
                      onClick={() => handleSizeToggle(size)}
                      className={`py-2 text-center text-xs font-medium border rounded-sm transition-all cursor-pointer ${
                        isSelected
                          ? "border-[#1c1a18] bg-[#1c1a18] text-white"
                          : "border-[#1c1a18]/10 hover:border-[#1c1a18] text-[#1c1a18]/70"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Clear filters */}
            {(selectedCategories.length > 0 || selectedSizes.length > 0) && (
              <button
                onClick={() => {
                  setSelectedCategories([]);
                  setSelectedSizes([]);
                }}
                className="w-full py-2.5 border border-[#b5573a] text-[#b5573a] hover:bg-[#b5573a] hover:text-white transition-colors text-xs font-semibold uppercase tracking-wider rounded-sm cursor-pointer"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </aside>

        {/* Results Grid */}
        <div className="flex-grow">
          {filteredProducts.length === 0 ? (
            <div className="py-20 text-center select-none">
              <p className="text-sm text-[#1c1a18]/50 mb-6">
                Không tìm thấy sản phẩm phù hợp với từ khóa của bạn.
              </p>
              <Link
                href="/collection"
                className="inline-flex items-center rounded-sm bg-[#1c1a18] px-8 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-[#b5573a]"
              >
                Xem tất cả sản phẩm
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
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
