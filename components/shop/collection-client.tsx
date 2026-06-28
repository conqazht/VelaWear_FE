"use client";

import { useMemo, useState, useEffect } from "react";
import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductCard } from "@/components/shop/product-card";
import { cn } from "@/lib/utils";
import { categoryLabels, Product, mapBackendProduct } from "@/lib/vela-data";
import apiClient from "@/lib/api-client";
import { getActiveLocale } from "@/lib/i18n";

export function CollectionClient({ products: initialProducts }: { products: Product[] }) {
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [activeFilters, setActiveFilters] = useState(["ÁO SƠ MI", "SIZE M"]);
  const [sortBy, setSortBy] = useState("Newest");

  const [categories, setCategories] = useState<Array<{ id: number; name: string; slug: string }>>([]);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isLoading, setIsLoading] = useState(true);

  const activeLocale = getActiveLocale();

  // Fetch categories and products on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [catsRes, prodsRes] = await Promise.all([
          apiClient.get(`/categories?size=100&locale=${activeLocale}`),
          apiClient.get(`/products?size=100&locale=${activeLocale}`),
        ]);

        if (catsRes.data?.data?.result) {
          setCategories(catsRes.data.data.result);
        }

        if (prodsRes.data?.data?.result) {
          const mapped = prodsRes.data.data.result.map((p: Parameters<typeof mapBackendProduct>[0]) => mapBackendProduct(p, activeLocale));
          setProducts(mapped);
        }
      } catch (err) {
        console.error("Failed to load collection data from BE API", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [activeLocale]);

  // Compute category tabs list dynamically from backend categories
  const categoryTabsList = useMemo(() => {
    const list = ["ALL"];
    categories.forEach((cat) => {
      const key = cat.slug.toUpperCase().replace("-", " ");
      if (!list.includes(key)) {
        list.push(key);
      }
    });
    return list;
  }, [categories]);

  // Compute dynamic category labels to handle any custom backend categories
  const dynamicCategoryLabels = useMemo(() => {
    const labels: Record<string, string> = {};
    categories.forEach((cat) => {
      const key = cat.slug.toUpperCase().replace("-", " ");
      labels[key] = cat.name;
    });
    labels["ALL"] = categoryLabels["ALL"] || "Tất cả";
    return labels;
  }, [categories]);

  const filteredProducts = useMemo(() => {
    const items = products.filter(
      (product) =>
        selectedCategory === "ALL" || product.category === selectedCategory
    );

    return [...items].sort((a, b) => {
      if (sortBy === "PriceLowToHigh") return a.price - b.price;
      if (sortBy === "PriceHighToLow") return b.price - a.price;
      return 0;
    });
  }, [products, selectedCategory, sortBy]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <span className="text-xs uppercase tracking-widest text-ink/40">Loading collection...</span>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-6 border-b border-[#1c1a18]/10 pb-6">
        <div className="flex flex-wrap gap-4 md:gap-8">
          {categoryTabsList.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "-mb-6 border-b-2 pb-2 text-xs font-medium uppercase tracking-wider transition-all duration-300 cursor-pointer",
                selectedCategory === cat
                  ? "border-[#1c1a18] font-semibold text-[#1c1a18]"
                  : "border-transparent text-[#1c1a18]/45 hover:text-[#1c1a18]"
              )}
            >
              {dynamicCategoryLabels[cat] || cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-light uppercase tracking-widest text-[#1c1a18]/50">
            Sort by:
          </span>
          <Select
            value={sortBy}
            onValueChange={(value) => value && setSortBy(value)}
          >
            <SelectTrigger className="h-8 rounded-sm border-transparent bg-transparent px-2 text-xs font-semibold uppercase tracking-wider text-[#1c1a18] focus-visible:ring-[#b85a3c]/30 cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-sm bg-[#f7f4ef] text-[#1c1a18]">
              <SelectItem value="Newest">Newest</SelectItem>
              <SelectItem value="PriceLowToHigh">Price: Low to High</SelectItem>
              <SelectItem value="PriceHighToLow">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {activeFilters.length > 0 && (
        <div className="mb-10 flex flex-wrap items-center gap-3">
          <span className="text-[10px] font-medium uppercase tracking-widest text-[#1c1a18]/45">
            Selected tags:
          </span>
          {activeFilters.map((filter) => (
            <Badge
              key={filter}
              variant="outline"
              className="h-7 gap-2 rounded-sm border-[#1c1a18]/5 bg-[#efebe4] px-3 text-[9px] font-medium uppercase tracking-widest text-[#1c1a18]"
            >
              {filter}
              <button
                type="button"
                onClick={() =>
                  setActiveFilters((filters) =>
                    filters.filter((value) => value !== filter)
                  )
                }
                aria-label={`Remove ${filter}`}
                className="transition-colors hover:text-[#b85a3c] cursor-pointer"
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
          <Button
            type="button"
            variant="ghost"
            onClick={() => setActiveFilters([])}
            className="h-7 rounded-sm px-2 text-[9px] font-semibold uppercase tracking-widest text-[#b85a3c] hover:bg-[#efebe4] cursor-pointer"
          >
            Clear All
          </Button>
        </div>
      )}

      {filteredProducts.length === 0 ? (
        <div className="mb-20 text-center py-12">
          <p className="text-sm text-[#55423d]/60">Không tìm thấy sản phẩm nào trong danh mục này.</p>
        </div>
      ) : (
        <div className="mb-20 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </>
  );
}
