import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Locale } from "@/lib/i18n";
import type { Product } from "@/lib/vela-data";

const { getStorefrontProductsMock, mapBackendProductMock } = vi.hoisted(() => ({
  getStorefrontProductsMock: vi.fn(),
  mapBackendProductMock: vi.fn((product: Product) => product),
}));

vi.mock("@/lib/api/catalog", () => ({
  getStorefrontProducts: getStorefrontProductsMock,
}));

vi.mock("@/lib/vela-data", () => ({
  mapBackendProduct: mapBackendProductMock,
}));

import { useSearchSuggestions } from "@/components/shop/use-search-suggestions";

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
};

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

function product(id: string, name: string): Product {
  return {
    id,
    name,
    price: 100_000,
    image: "/product.jpg",
    category: "Shirts",
    color: "Black",
    size: "M",
    description: `${name} description`,
  };
}

async function advanceDebounce() {
  await act(async () => {
    vi.advanceTimersByTime(180);
    await Promise.resolve();
  });
}

describe("useSearchSuggestions", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    getStorefrontProductsMock.mockReset();
    mapBackendProductMock.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("không cho response cũ ghi đè response của query mới", async () => {
    const oldRequest = deferred<{ result: Product[] }>();
    const newRequest = deferred<{ result: Product[] }>();
    getStorefrontProductsMock
      .mockReturnValueOnce(oldRequest.promise)
      .mockReturnValueOnce(newRequest.promise);

    const { result, rerender } = renderHook(
      ({ query, locale }: { query: string; locale: Locale }) => useSearchSuggestions(query, locale),
      { initialProps: { query: "old", locale: "vi" as Locale } },
    );

    await advanceDebounce();
    expect(getStorefrontProductsMock).toHaveBeenCalledTimes(1);

    rerender({ query: "new", locale: "vi" });
    await advanceDebounce();
    expect(getStorefrontProductsMock).toHaveBeenCalledTimes(2);

    await act(async () => {
      newRequest.resolve({ result: [product("new", "New shirt")] });
      await newRequest.promise;
    });
    expect(result.current.map((item) => item.id)).toEqual(["new"]);

    await act(async () => {
      oldRequest.resolve({ result: [product("old", "Old shirt")] });
      await oldRequest.promise;
    });
    expect(result.current.map((item) => item.id)).toEqual(["new"]);
  });

  it("clear query vô hiệu hóa request đang chạy và xóa suggestions", async () => {
    const slowRequest = deferred<{ result: Product[] }>();
    getStorefrontProductsMock
      .mockResolvedValueOnce({ result: [product("ready", "Ready shirt")] })
      .mockReturnValueOnce(slowRequest.promise);

    const { result, rerender } = renderHook(
      ({ query, locale }: { query: string; locale: Locale }) => useSearchSuggestions(query, locale),
      { initialProps: { query: "ready", locale: "vi" as Locale } },
    );

    await advanceDebounce();
    expect(result.current.map((item) => item.id)).toEqual(["ready"]);

    rerender({ query: "slow", locale: "vi" });
    await advanceDebounce();
    expect(getStorefrontProductsMock).toHaveBeenCalledTimes(2);

    rerender({ query: "", locale: "vi" });
    expect(result.current).toEqual([]);

    await act(async () => {
      slowRequest.resolve({ result: [product("slow", "Slow shirt")] });
      await slowRequest.promise;
    });
    expect(result.current).toEqual([]);
  });

  it("hủy debounce khi component unmount", async () => {
    const { unmount } = renderHook(() => useSearchSuggestions("pending", "vi"));

    unmount();
    await advanceDebounce();

    expect(getStorefrontProductsMock).not.toHaveBeenCalled();
  });
});
