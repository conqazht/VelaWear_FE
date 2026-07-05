"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product } from "@/lib/vela-data";

type CartStore = {
  cart: CartItem[];
  addToCart: (product: Product, color?: string, size?: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      cart: [],
      addToCart: (product, color = product.color, size = product.size) => {
        set((state) => {
          const existingIndex = state.cart.findIndex(
            (item) =>
              item.id === product.id && item.color === color && item.size === size
          );

          if (existingIndex >= 0) {
            return {
              cart: state.cart.map((item, index) =>
                index === existingIndex
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          }

          return {
            cart: [
              ...state.cart,
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
            ],
          };
        });
      },
      updateQuantity: (id, quantity) => {
        if (quantity < 1) return;

        set((state) => ({
          cart: state.cart.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        }));
      },
      removeItem: (id) => {
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== id),
        }));
      },
      clearCart: () => set({ cart: [] }),
    }),
    {
      name: "vela-cart-v1",
      partialize: (state) => ({ cart: state.cart }),
    }
  )
);
