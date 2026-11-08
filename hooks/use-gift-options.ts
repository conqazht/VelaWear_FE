"use client";

import { useCallback, useSyncExternalStore } from "react";

export interface GiftOptions {
  enabled: boolean;
  boxType: "signature" | "eco";
  includeCard: boolean;
  cardTo: string;
  cardFrom: string;
  cardMessage: string;
}

export const DEFAULT_GIFT_OPTIONS: GiftOptions = {
  enabled: false,
  boxType: "signature",
  includeCard: true,
  cardTo: "",
  cardFrom: "",
  cardMessage: "",
};

export const GIFT_STORAGE_KEY = "vela_gift_options_v1";

let cachedOptions: GiftOptions = DEFAULT_GIFT_OPTIONS;
let cachedRaw: string | null = null;
const giftListeners = new Set<() => void>();

function notifyGiftListeners() {
  for (const listener of giftListeners) {
    listener();
  }
}

function getGiftSnapshot(): GiftOptions {
  if (typeof window === "undefined") return DEFAULT_GIFT_OPTIONS;
  try {
    const raw = window.localStorage.getItem(GIFT_STORAGE_KEY);
    if (!raw) {
      cachedRaw = null;
      cachedOptions = DEFAULT_GIFT_OPTIONS;
      return DEFAULT_GIFT_OPTIONS;
    }
    if (raw === cachedRaw) return cachedOptions;
    cachedRaw = raw;
    const parsed = JSON.parse(raw);
    cachedOptions = { ...DEFAULT_GIFT_OPTIONS, ...parsed };
    return cachedOptions;
  } catch {
    return DEFAULT_GIFT_OPTIONS;
  }
}

function subscribeGift(callback: () => void) {
  giftListeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    giftListeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

export function useGiftOptions() {
  const options = useSyncExternalStore(subscribeGift, getGiftSnapshot, () => DEFAULT_GIFT_OPTIONS);

  const isLoaded = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const updateOptions = useCallback((newOptions: Partial<GiftOptions>) => {
    try {
      const current = getGiftSnapshot();
      const updated = { ...current, ...newOptions };
      window.localStorage.setItem(GIFT_STORAGE_KEY, JSON.stringify(updated));
      cachedRaw = null;
      notifyGiftListeners();
    } catch {
      // Ignore storage errors
    }
  }, []);

  return { options, updateOptions, isLoaded };
}
