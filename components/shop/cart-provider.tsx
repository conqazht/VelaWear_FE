"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { CartItem, Product } from "@/lib/vela-data";

interface CartContextValue {
  cart: CartItem[];
  itemCount: number;
  subtotal: number;
  addToCart: (product: Product, color?: string, size?: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = useCallback(
    (product: Product, color = product.color, size = product.size) => {
      setCart((items) => {
        const existingIndex = items.findIndex(
          (item) =>
            item.id === product.id && item.color === color && item.size === size
        );

        if (existingIndex >= 0) {
          return items.map((item, index) =>
            index === existingIndex
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }

        return [
          ...items,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            color,
            size,
            image: product.image,
            quantity: 1,
            variantId: product.realId,
          },
        ];
      });
    },
    []
  );

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity < 1) return;
    setCart((items) =>
      items.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setCart((items) => items.filter((item) => item.id !== id));
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    return {
      cart,
      itemCount,
      subtotal,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart: () => setCart([]),
    };
  }, [addToCart, cart, removeItem, updateQuantity]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
