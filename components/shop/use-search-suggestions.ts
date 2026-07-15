"use client";

import { useEffect, useRef, useState } from "react";

import { getProducts } from "@/lib/api/catalog";
import type { Locale } from "@/lib/i18n";
import { matchesSearchText, normalizeSearchText } from "@/lib/search";
import { mapBackendProduct, type Product } from "@/lib/vela-data";

const SEARCH_DEBOUNCE_MS = 180;
const MAX_SEARCH_SUGGESTIONS = 4;

export function useSearchSuggestions(searchQuery: string, activeLocale: Locale) {
  const [result, setResult] = useState<{
    locale: Locale;
    query: string;
    suggestions: Product[];
  } | null>(null);
  const requestGenerationRef = useRef(0);
  const trimmedQuery = searchQuery.trim();

  useEffect(() => {
    const requestGeneration = ++requestGenerationRef.current;

    if (!trimmedQuery) {
      return () => {
        if (requestGenerationRef.current === requestGeneration) {
          requestGenerationRef.current += 1;
        }
      };
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        const data = await getProducts({ size: 500, locale: activeLocale });
        if (requestGeneration !== requestGenerationRef.current) return;

        const mapped = (data.result || []).map(
          (product: Parameters<typeof mapBackendProduct>[0]) =>
            mapBackendProduct(product, activeLocale),
        );
        const normalizedQuery = normalizeSearchText(trimmedQuery);
        const filtered = mapped.filter((product) => {
          const searchable = [
            product.name,
            product.category,
            product.id,
            product.description,
          ]
            .filter(Boolean)
            .join(" ");
          return matchesSearchText(searchable, normalizedQuery);
        });

        setResult({
          locale: activeLocale,
          query: trimmedQuery,
          suggestions: filtered.slice(0, MAX_SEARCH_SUGGESTIONS),
        });
      } catch {
        // Suggestions are optional; ignore catalog lookup failures.
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
      if (requestGenerationRef.current === requestGeneration) {
        requestGenerationRef.current += 1;
      }
    };
  }, [activeLocale, trimmedQuery]);

  if (
    !trimmedQuery ||
    result?.locale !== activeLocale ||
    result.query !== trimmedQuery
  ) {
    return [];
  }

  return result.suggestions;
}
