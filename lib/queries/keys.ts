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
  storefrontCatalog: {
    root: ["storefront-catalog"] as const,
    list: (filters: unknown, locale?: string) => ["storefront-catalog", filters, locale] as const,
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
    me: (accountId: number | undefined) => ["cart", "me", accountId ?? "anonymous"] as const,
  },
  wishlists: {
    root: ["wishlists"] as const,
    list: (userId: number | undefined, params?: unknown, locale?: string) =>
      ["wishlists", "user", userId ?? "anonymous", params, locale] as const,
  },
  coupons: {
    root: ["coupons"] as const,
    list: (params?: unknown) => ["coupons", params] as const,
    my: ["coupons", "me"] as const,
  },
  orders: {
    root: ["orders"] as const,
    meList: (accountId: number | undefined, params?: unknown) =>
      ["orders", "me", accountId ?? "anonymous", "list", params] as const,
    meByCode: (accountId: number | undefined, orderCode: string) =>
      ["orders", "me", accountId ?? "anonymous", "code", orderCode] as const,
    meById: (accountId: number | undefined, orderId: number | undefined) =>
      ["orders", "me", accountId ?? "anonymous", "id", orderId ?? "pending"] as const,
    meStatusHistories: (
      accountId: number | undefined,
      orderId: number | undefined,
      params?: unknown,
    ) =>
      [
        "orders",
        "me",
        accountId ?? "anonymous",
        "id",
        orderId ?? "pending",
        "status-histories",
        params,
      ] as const,
  },
  payments: {
    root: ["payments"] as const,
  },
  addresses: {
    root: ["user-addresses"] as const,
    meList: (accountId: number | undefined, params?: unknown) =>
      ["user-addresses", "me", accountId ?? "anonymous", "list", params] as const,
    meById: (accountId: number | undefined, addressId: number | undefined) =>
      ["user-addresses", "me", accountId ?? "anonymous", "id", addressId ?? "pending"] as const,
  },
  reviews: {
    root: ["reviews"] as const,
    list: (params?: unknown) => ["reviews", params] as const,
    product: (productId: number, params?: unknown) =>
      ["reviews", "product", productId, params] as const,
    summary: (productId: number) => ["reviews", "product", productId, "summary"] as const,
    me: (params?: unknown) => ["reviews", "me", params] as const,
  },
};
