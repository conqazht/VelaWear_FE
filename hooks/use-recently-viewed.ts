"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { Product } from "@/lib/vela-data";

export const STORAGE_KEY = "vela_recently_viewed_v1";
export const MAX_ITEMS = 6;

export interface RecentlyViewedItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  timestamp: number;
}

const emptyArray: RecentlyViewedItem[] = [];
let memoryCache: RecentlyViewedItem[] = emptyArray;
let rawCache: string | null = null;
const listeners = new Set<() => void>();

function notifyListeners() {
  for (const listener of listeners) {
    listener();
  }
}

function getRecentlyViewedSnapshot(): RecentlyViewedItem[] {
  if (typeof window === "undefined") return emptyArray;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      rawCache = null;
      memoryCache = emptyArray;
      return emptyArray;
    }
    if (raw === rawCache) return memoryCache;
    rawCache = raw;
    const parsed = JSON.parse(raw);
    memoryCache = Array.isArray(parsed) ? parsed : emptyArray;
    return memoryCache;
  } catch {
    return emptyArray;
  }
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

export function useRecentlyViewed() {
  const items = useSyncExternalStore(subscribe, getRecentlyViewedSnapshot, () => emptyArray);

  const isLoaded = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const addProduct = useCallback((product: Product) => {
    try {
      const current = getRecentlyViewedSnapshot();
      const filtered = current.filter((item) => String(item.id) !== String(product.id));
      const newItem: RecentlyViewedItem = {
        id: String(product.id),
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        category: product.category,
        timestamp: Date.now(),
      };
      const updated = [newItem, ...filtered].slice(0, MAX_ITEMS);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      rawCache = null;
      notifyListeners();
    } catch {
      // Ignore storage errors
    }
  }, []);

  const removeProduct = useCallback((id: string) => {
    try {
      const current = getRecentlyViewedSnapshot();
      const updated = current.filter((item) => String(item.id) !== String(id));
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      rawCache = null;
      notifyListeners();
    } catch {
      // Ignore storage errors
    }
  }, []);

  const clearAll = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      rawCache = null;
      notifyListeners();
    } catch {
      // Ignore storage errors
    }
  }, []);

  return {
    items,
    isLoaded,
    addProduct,
    removeProduct,
    clearAll,
  };
}
