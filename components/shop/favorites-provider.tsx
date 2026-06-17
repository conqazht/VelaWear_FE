"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { Product } from "@/lib/vela-data";
import { useNotification } from "./notification-provider";

interface FavoritesContextValue {
  favorites: Product[];
  addToFavorites: (product: Product, size?: string) => void;
  removeFromFavorites: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (product: Product, size?: string) => void;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const { showAddedToFavorites } = useNotification();

  const isFavorite = useCallback((productId: string) => {
    return favorites.some((item) => item.id === productId);
  }, [favorites]);

  const addToFavorites = useCallback((product: Product, size = "M") => {
    setFavorites((prev) => {
      if (prev.some((item) => item.id === product.id)) return prev;
      return [...prev, product];
    });
    showAddedToFavorites(product, size);
  }, [showAddedToFavorites]);

  const removeFromFavorites = useCallback((productId: string) => {
    setFavorites((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  const toggleFavorite = useCallback((product: Product, size = "M") => {
    if (isFavorite(product.id)) {
      removeFromFavorites(product.id);
    } else {
      addToFavorites(product, size);
    }
  }, [isFavorite, addToFavorites, removeFromFavorites]);

  const value = useMemo(() => ({
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite,
  }), [favorites, addToFavorites, removeFromFavorites, isFavorite, toggleFavorite]);

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used inside FavoritesProvider");
  }
  return context;
}
