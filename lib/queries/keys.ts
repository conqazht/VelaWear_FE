export const queryKeys = {
  auth: {
    root: ["auth"] as const,
    session: ["auth", "session"] as const,
  },
  products: {
    root: ["products"] as const,
    list: (filters: unknown, locale?: string) => ["products", filters, locale] as const,
    detail: (id: number | string, locale?: string) => ["product", id, locale] as const,
  },
  catalog: {
    categories: (params?: unknown, locale?: string) => ["categories", params, locale] as const,
    brands: (params?: unknown) => ["brands", params] as const,
    colors: (params?: unknown) => ["colors", params] as const,
    sizes: (params?: unknown) => ["sizes", params] as const,
    variants: (params?: unknown) => ["product-variants", params] as const,
  },
  cart: {
    root: ["cart"] as const,
    byUser: (userId: number) => ["cart", "user", userId] as const,
  },
  wishlists: {
    root: ["wishlists"] as const,
    list: (userId: number | undefined, params?: unknown) =>
      ["wishlists", "user", userId ?? "anonymous", params] as const,
  },
  coupons: {
    root: ["coupons"] as const,
    list: (params?: unknown) => ["coupons", params] as const,
    my: ["coupons", "me"] as const,
  },
  orders: {
    root: ["orders"] as const,
    byUser: (userId: number, params?: unknown) =>
      ["orders", "user", userId, params] as const,
    byCode: (orderCode: string) => ["orders", "code", orderCode] as const,
  },
  payments: {
    root: ["payments"] as const,
  },
  addresses: {
    root: ["user-addresses"] as const,
    list: (params?: unknown) => ["user-addresses", params] as const,
  },
  reviews: {
    root: ["reviews"] as const,
    list: (params?: unknown) => ["reviews", params] as const,
  },
};
