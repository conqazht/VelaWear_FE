"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product } from "@/lib/vela-data";

/**
 * Owner discriminator for cart isolation.
 * - `"anonymous"` — guest/unauthenticated cart
 * - `"user:<id>"` — cart belonging to a specific authenticated account
 */
export type CartOwner = "anonymous" | `user:${number}`;

type PersistedCartState = {
  cart: CartItem[];
  owner: CartOwner;
  version: 2;
};

type CartStore = {
  cart: CartItem[];
  owner: CartOwner;
  setCart: (cart: CartItem[]) => void;
  attachVariant: (id: string, variantId: number) => void;
  addToCart: (product: Product, color?: string, size?: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  /**
   * Claim the cart for the given user. If the current owner is `anonymous`,
   * items are kept (claimed). If the owner differs, items are cleared first.
   */
  claimForUser: (userId: number) => void;
  /**
   * Release ownership back to anonymous and clear the cart.
   * Used on logout/revocation.
   */
  releaseToAnonymous: () => void;
};

function migrateV1ToV2(
  _persisted: Record<string, unknown>,
): PersistedCartState {
  // v1 had no owner — discard ownerless data to prevent cross-account leaks
  return { cart: [], owner: "anonymous", version: 2 };
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      cart: [],
      owner: "anonymous" as CartOwner,
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
                listPrice: product.originalPrice ?? product.pricing?.listPrice,
                priceSource: product.pricing?.priceSource,
                campaignId: product.pricing?.campaignId ?? undefined,
                campaignItemId: product.pricing?.campaignItemId ?? undefined,
                campaignCode: product.pricing?.campaignCode ?? undefined,
                campaignName: product.pricing?.campaignName ?? undefined,
                campaignEndsAt: product.pricing?.endsAt ?? undefined,
                remainingQuota: product.pricing?.remainingQuota ?? undefined,
                maxPerCustomer: product.pricing?.maxPerCustomer ?? undefined,
                customerRemaining: product.pricing?.customerRemaining ?? undefined,
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
      claimForUser: (userId) => set((state) => {
        const targetOwner: CartOwner = `user:${userId}`;
        if (state.owner === targetOwner) return state;
        // Anonymous → user: claim existing items
        if (state.owner === "anonymous") {
          return { owner: targetOwner };
        }
        // Different user → clear and assign
        return { cart: [], owner: targetOwner };
      }),
      releaseToAnonymous: () => set({ cart: [], owner: "anonymous" }),
    }),
    {
      name: "vela-cart-v2",
      version: 2,
      partialize: (state): PersistedCartState => ({
        cart: state.cart,
        owner: state.owner,
        version: 2,
      }),
      migrate: (persisted, version) => {
        if (version < 2) {
          return migrateV1ToV2(persisted as Record<string, unknown>);
        }
        return persisted as PersistedCartState;
      },
    },
  ),
);
