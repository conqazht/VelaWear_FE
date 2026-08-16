"use client";

import { useEffect, useRef, useState } from "react";

import { getStorefrontProducts } from "@/lib/api/catalog";
import type { Locale } from "@/lib/i18n";
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
        const data = await getStorefrontProducts({
          q: trimmedQuery,
          size: MAX_SEARCH_SUGGESTIONS,
          page: 1,
          sort: "featured",
          locale: activeLocale,
        });
        if (requestGeneration !== requestGenerationRef.current) return;

        const mapped = (data.result || []).map((product: Parameters<typeof mapBackendProduct>[0]) =>
          mapBackendProduct(product, activeLocale),
        );
        setResult({
          locale: activeLocale,
          query: trimmedQuery,
          suggestions: mapped.slice(0, MAX_SEARCH_SUGGESTIONS),
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

  if (!trimmedQuery || result?.locale !== activeLocale || result.query !== trimmedQuery) {
    return [];
  }

  return result.suggestions;
}
