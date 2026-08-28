"use client";

import { createContext, useContext, useMemo } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import type { CartItem, Product } from "@/lib/vela-data";
import { useCartStore } from "@/store/cart-store";
import { useCartSync } from "@/components/shop/use-cart-sync";

export interface CartContextValue {
  cart: CartItem[];
  itemCount: number;
  subtotal: number;
  addToCart: (product: Product, color?: string, size?: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { locale } = useI18n();
  const storedCart = useCartStore((state) => state.cart);
  const storedOwner = useCartStore((state) => state.owner);
  const addToLocalCart = useCartStore((state) => state.addToCart);
  const attachVariant = useCartStore((state) => state.attachVariant);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);

  const { cart, refreshCart, addToCart } = useCartSync({
    isAuthenticated,
    isAuthLoading,
    userId: user?.id,
    locale,
    storedCart,
    storedOwner,
    addToLocalCart,
    attachVariant,
  });

  const value = useMemo<CartContextValue>(() => {
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return {
      cart,
      itemCount,
      subtotal,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
      refreshCart,
    };
  }, [addToCart, cart, clearCart, refreshCart, removeItem, updateQuantity]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
