import type { QueryClient } from "@tanstack/react-query";

export const publicCacheQueryKeys = {
  productLists: ["products"] as const,
  productDetails: ["product"] as const,
  categories: ["categories"] as const,
  brands: ["brands"] as const,
  sales: ["sales"] as const,
};

export type PublicCacheArea = keyof typeof publicCacheQueryKeys;

export async function invalidatePublicQueries(
  queryClient: QueryClient,
  areas: readonly PublicCacheArea[],
) {
  const uniqueAreas = [...new Set(areas)];
  await Promise.all(
    uniqueAreas.map((area) =>
      queryClient.invalidateQueries({ queryKey: publicCacheQueryKeys[area] }),
    ),
  );
}
