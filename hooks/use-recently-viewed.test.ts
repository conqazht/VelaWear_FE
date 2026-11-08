import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, beforeEach } from "vitest";

import { useRecentlyViewed } from "@/hooks/use-recently-viewed";
import type { Product } from "@/lib/vela-data";

const mockProductA: Product = {
  id: "prod-1",
  name: "Tailored Linen Blazer",
  price: 2890000,
  image: "/images/fixtures/products/linen-blazer/card.webp",
  category: "AO",
  badge: "NEW",
  color: "Black",
  size: "M",
  description: "Linen blazer",
  material: "100% Linen",
};

const mockProductB: Product = {
  id: "prod-2",
  name: "Silk Blouse",
  price: 1450000,
  image: "/images/fixtures/products/silk-blouse/card.webp",
  category: "AO",
  badge: "BESTSELLER",
  color: "White",
  size: "S",
  description: "Mulberry silk blouse",
  material: "100% Mulberry Silk",
};

describe("useRecentlyViewed", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts with empty list when no stored items", () => {
    const { result } = renderHook(() => useRecentlyViewed());
    expect(result.current.items).toEqual([]);
    expect(result.current.isLoaded).toBe(true);
  });

  it("adds products to recently viewed list without duplicates", () => {
    const { result } = renderHook(() => useRecentlyViewed());

    act(() => {
      result.current.addProduct(mockProductA);
    });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].id).toBe("prod-1");

    act(() => {
      result.current.addProduct(mockProductB);
    });
    expect(result.current.items).toHaveLength(2);
    expect(result.current.items[0].id).toBe("prod-2");

    // Re-adding product A moves it to the front
    act(() => {
      result.current.addProduct(mockProductA);
    });
    expect(result.current.items).toHaveLength(2);
    expect(result.current.items[0].id).toBe("prod-1");
  });

  it("removes a product by id", () => {
    const { result } = renderHook(() => useRecentlyViewed());

    act(() => {
      result.current.addProduct(mockProductA);
      result.current.addProduct(mockProductB);
    });
    expect(result.current.items).toHaveLength(2);

    act(() => {
      result.current.removeProduct("prod-1");
    });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].id).toBe("prod-2");
  });

  it("clears all items", () => {
    const { result } = renderHook(() => useRecentlyViewed());

    act(() => {
      result.current.addProduct(mockProductA);
      result.current.addProduct(mockProductB);
    });
    expect(result.current.items).toHaveLength(2);

    act(() => {
      result.current.clearAll();
    });
    expect(result.current.items).toHaveLength(0);
  });
});
