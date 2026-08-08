import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CartOwner } from "@/store/cart-store";

// Reset module state between tests
beforeEach(() => {
  vi.resetModules();
  // Clear any localStorage from previous tests
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem("vela-cart-v1");
    localStorage.removeItem("vela-cart-v2");
  }
});

afterEach(() => {
  vi.restoreAllMocks();
});

function makeCartItem(variantId: number, name = `Item ${variantId}`) {
  return {
    id: `variant-${variantId}`,
    productId: variantId,
    productSlug: `product-${variantId}`,
    name,
    price: 100,
    color: "Black",
    size: "M",
    image: "/img.jpg",
    quantity: 1,
    variantId,
  };
}

async function loadStore() {
  const mod = await import("@/store/cart-store");
  return mod.useCartStore;
}

describe("cart-store ownership", () => {
  it("starts as anonymous with empty cart", async () => {
    const useCartStore = await loadStore();
    const state = useCartStore.getState();
    expect(state.owner).toBe("anonymous");
    expect(state.cart).toEqual([]);
  });

  it("anonymous reload preserves items and owner", async () => {
    const useCartStore = await loadStore();
    useCartStore.setState({ cart: [makeCartItem(1)], owner: "anonymous" });

    // Simulate reload by re-importing
    vi.resetModules();
    const useCartStore2 = (await import("@/store/cart-store")).useCartStore;
    // Wait for hydration
    await vi.waitFor(() => {
      const s = useCartStore2.getState();
      expect(s.owner).toBe("anonymous");
      expect(s.cart).toHaveLength(1);
    });
  });

  it("claimForUser: anonymous → user:42 keeps items", async () => {
    const useCartStore = await loadStore();
    useCartStore.setState({ cart: [makeCartItem(1)], owner: "anonymous" });

    useCartStore.getState().claimForUser(42);

    const state = useCartStore.getState();
    expect(state.owner).toBe("user:42");
    expect(state.cart).toHaveLength(1);
    expect(state.cart[0].variantId).toBe(1);
  });

  it("claimForUser: same user is a no-op", async () => {
    const useCartStore = await loadStore();
    const item = makeCartItem(5);
    useCartStore.setState({
      cart: [item],
      owner: "user:42" as CartOwner,
    });

    useCartStore.getState().claimForUser(42);
    const state = useCartStore.getState();
    expect(state.owner).toBe("user:42");
    expect(state.cart).toEqual([item]);
  });

  it("claimForUser: user:42 → user:99 clears cart (A→B isolation)", async () => {
    const useCartStore = await loadStore();
    useCartStore.setState({
      cart: [makeCartItem(1), makeCartItem(2)],
      owner: "user:42" as CartOwner,
    });

    useCartStore.getState().claimForUser(99);

    const state = useCartStore.getState();
    expect(state.owner).toBe("user:99");
    expect(state.cart).toEqual([]);
  });

  it("releaseToAnonymous clears cart and resets owner", async () => {
    const useCartStore = await loadStore();
    useCartStore.setState({
      cart: [makeCartItem(1)],
      owner: "user:42" as CartOwner,
    });

    useCartStore.getState().releaseToAnonymous();

    const state = useCartStore.getState();
    expect(state.owner).toBe("anonymous");
    expect(state.cart).toEqual([]);
  });

  it("v1 legacy data is discarded on migration (ownerless data cannot enter an account)", async () => {
    // Simulate v1 persisted data (no owner, old key)
    localStorage.setItem(
      "vela-cart-v1",
      JSON.stringify({
        state: { cart: [makeCartItem(99)] },
        version: 0,
      }),
    );

    const useCartStore = await loadStore();
    const state = useCartStore.getState();

    // v2 store uses a different key, so v1 data is ignored
    expect(state.owner).toBe("anonymous");
    // v1 data should NOT appear in the new store
    expect(state.cart.find((i) => i.variantId === 99)).toBeUndefined();
  });

  it("user reload preserves owner and items", async () => {
    const useCartStore = await loadStore();
    useCartStore.setState({
      cart: [makeCartItem(7)],
      owner: "user:42" as CartOwner,
    });

    vi.resetModules();
    const useCartStore2 = (await import("@/store/cart-store")).useCartStore;
    await vi.waitFor(() => {
      const s = useCartStore2.getState();
      expect(s.owner).toBe("user:42");
      expect(s.cart).toHaveLength(1);
      expect(s.cart[0].variantId).toBe(7);
    });
  });
});
