import { describe, expect, it } from "vitest";
import {
  getPersistableCartItems,
  indexCartByVariant,
  mergeServerCartWithLatestState,
  applyLocalizedCartCopy,
  mapServerCartItems,
} from "@/components/shop/use-cart-sync";
import type { CartItem } from "@/lib/vela-data";
import type { Cart as ApiCart } from "@/lib/api/types";

describe("use-cart-sync pure reconciliation helpers", () => {
  const itemVariant10: CartItem = {
    id: "item-1",
    variantId: 10,
    name: "Classic Linen Shirt",
    price: 250_000,
    color: "White",
    size: "M",
    image: "/images/fixtures/products/classic-linen-shirt/card.webp",
    quantity: 2,
  };

  const itemVariant20: CartItem = {
    id: "item-2",
    variantId: 20,
    name: "Pleated Trousers",
    price: 450_000,
    color: "Black",
    size: "L",
    image: "/images/fixtures/products/pleated-wool-trousers/card.webp",
    quantity: 1,
  };

  const itemUnresolved: CartItem = {
    id: "item-3",
    name: "Pending Variant Product",
    price: 300_000,
    color: "Default",
    size: "Default",
    image: "/images/fixtures/products/signature-hemp-tee/card.webp",
    quantity: 1,
  };

  describe("getPersistableCartItems", () => {
    it("extracts only items with variantId and maps to { variantId, quantity }", () => {
      const items: CartItem[] = [itemVariant10, itemUnresolved, itemVariant20];
      const persistable = getPersistableCartItems(items);

      expect(persistable).toEqual([
        { variantId: 10, quantity: 2 },
        { variantId: 20, quantity: 1 },
      ]);
    });

    it("returns empty array when cart has no items with variantId", () => {
      expect(getPersistableCartItems([itemUnresolved])).toEqual([]);
      expect(getPersistableCartItems([])).toEqual([]);
    });
  });

  describe("indexCartByVariant", () => {
    it("creates a Map keyed by variantId", () => {
      const indexed = indexCartByVariant([itemVariant10, itemUnresolved, itemVariant20]);
      expect(indexed.size).toBe(2);
      expect(indexed.get(10)).toBe(itemVariant10);
      expect(indexed.get(20)).toBe(itemVariant20);
      expect(indexed.has(999)).toBe(false);
    });
  });

  describe("mergeServerCartWithLatestState", () => {
    it("retains the latest local quantity if user modified quantity while sync was in flight", () => {
      const serverItems: CartItem[] = [{ ...itemVariant10, quantity: 2 }];
      const cartAtRequestStart: CartItem[] = [{ ...itemVariant10, quantity: 2 }];
      // User clicked +1 while request was flying:
      const latestCart: CartItem[] = [{ ...itemVariant10, quantity: 3 }];

      const merged = mergeServerCartWithLatestState(serverItems, cartAtRequestStart, latestCart);

      expect(merged).toHaveLength(1);
      expect(merged[0]?.variantId).toBe(10);
      expect(merged[0]?.quantity).toBe(3); // Preserved latest quantity 3!
    });

    it("removes server item if user deleted it locally while sync was in flight", () => {
      const serverItems: CartItem[] = [{ ...itemVariant10, quantity: 2 }, itemVariant20];
      const cartAtRequestStart: CartItem[] = [itemVariant10, itemVariant20];
      // User deleted item 10 while request was flying:
      const latestCart: CartItem[] = [itemVariant20];

      const merged = mergeServerCartWithLatestState(serverItems, cartAtRequestStart, latestCart);

      expect(merged).toHaveLength(1);
      expect(merged[0]?.variantId).toBe(20);
    });

    it("preserves unresolved local items not yet on the server", () => {
      const serverItems: CartItem[] = [itemVariant10];
      const cartAtRequestStart: CartItem[] = [itemVariant10, itemUnresolved];
      const latestCart: CartItem[] = [itemVariant10, itemUnresolved];

      const merged = mergeServerCartWithLatestState(serverItems, cartAtRequestStart, latestCart);

      expect(merged).toHaveLength(2);
      expect(merged.some((i) => i.variantId === 10)).toBe(true);
      expect(merged.some((i) => i.id === "item-3")).toBe(true);
    });
  });

  describe("mapServerCartItems", () => {
    it("maps api cart correctly with locale fallbacks", () => {
      const apiCart: ApiCart = {
        id: 1,
        items: [
          {
            id: 1,
            variantId: 101,
            productId: 5,
            productSlug: "ao-linen",
            productName: "Áo sơ mi linen",
            price: 250000,
            listPrice: 300000,
            quantity: 2,
            image: "https://example.com/image.jpg",
            pricing: {
              effectivePrice: 250000,
              listPrice: 300000,
              priceSource: "FLASH_SALE",
            },
          },
        ],
      };

      const mapped = mapServerCartItems(apiCart, "vi");
      expect(mapped).toHaveLength(1);
      expect(mapped[0]?.id).toBe("variant-101");
      expect(mapped[0]?.name).toBe("Áo sơ mi linen");
      expect(mapped[0]?.price).toBe(250000);
      expect(mapped[0]?.listPrice).toBe(300000);
      expect(mapped[0]?.priceSource).toBe("FLASH_SALE");
      expect(mapped[0]?.quantity).toBe(2);
    });
  });

  describe("applyLocalizedCartCopy", () => {
    it("updates product names and localized copy without mutating local quantities", () => {
      const currentCart: CartItem[] = [{ ...itemVariant10, quantity: 5 }];
      const localizedItems: CartItem[] = [
        {
          ...itemVariant10,
          name: "Áo sơ mi Linen Cao Cấp",
          quantity: 1, // Server copy has default quantity 1
        },
      ];

      const localizedCart = applyLocalizedCartCopy(currentCart, localizedItems);

      expect(localizedCart[0]?.name).toBe("Áo sơ mi Linen Cao Cấp");
      expect(localizedCart[0]?.quantity).toBe(5); // Retained user's 5!
    });
  });
});
