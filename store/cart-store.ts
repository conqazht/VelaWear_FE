"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product } from "@/lib/vela-data";

type CartStore = {
  cart: CartItem[];
  setCart: (cart: CartItem[]) => void;
  attachVariant: (id: string, variantId: number) => void;
  addToCart: (product: Product, color?: string, size?: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      cart: [],
      setCart: (cart) => set({ cart }),
      attachVariant: (id, variantId) => set((state) => ({
        cart: state.cart.map((item) =>
          item.id === id ? { ...item, id: `variant-${variantId}`, variantId } : item
        ),
      })),
      addToCart: (product, color = product.color, size = product.size) => {
        set((state) => {
          const existingIndex = state.cart.findIndex((item) =>
            product.variantId !== undefined
              ? item.variantId === product.variantId
              : item.id === product.id && item.color === color && item.size === size
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
                id: product.variantId !== undefined
                  ? `variant-${product.variantId}`
                  : `${product.id}-${color}-${size}`,
                productId: product.realId,
                productSlug: product.id,
                name: product.name,
                price: product.price,
                color,
                size,
                image: product.image,
                quantity: 1,
                variantId: product.variantId,
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
