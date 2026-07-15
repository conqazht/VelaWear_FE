import type { ReactNode } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  updateAdminProductStatusMock,
  updateAdminProductTranslationsMock,
  updateAdminProductVariantStatusMock,
  updateAdminCategoryTranslationsMock,
} = vi.hoisted(() => ({
  updateAdminProductStatusMock: vi.fn(),
  updateAdminProductTranslationsMock: vi.fn(),
  updateAdminProductVariantStatusMock: vi.fn(),
  updateAdminCategoryTranslationsMock: vi.fn(),
}));

vi.mock("@/lib/api/admin-commerce", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/admin-commerce")>();
  return {
    ...actual,
    updateAdminProductStatus: updateAdminProductStatusMock,
    updateAdminProductTranslations: updateAdminProductTranslationsMock,
    updateAdminProductVariantStatus: updateAdminProductVariantStatusMock,
    updateAdminCategoryTranslations: updateAdminCategoryTranslationsMock,
  };
});

import {
  adminCommerceQueryKeys,
  useUpdateAdminProductStatusMutation,
  useUpdateAdminProductTranslationsMutation,
  useUpdateAdminProductVariantStatusMutation,
  useUpdateAdminCategoryTranslationsMutation,
} from "@/lib/queries/admin-commerce";

describe("admin status optimistic mutation", () => {
  beforeEach(() => {
    updateAdminProductStatusMock.mockReset();
    updateAdminProductTranslationsMock.mockReset().mockResolvedValue({ translations: [] });
    updateAdminProductVariantStatusMock.mockReset().mockResolvedValue({ id: 8 });
    updateAdminCategoryTranslationsMock.mockReset().mockResolvedValue({ translations: [] });
  });

  it("restores the previous Product status when PATCH fails", async () => {
    let rejectRequest: ((reason?: unknown) => void) | undefined;
    updateAdminProductStatusMock.mockImplementation(
      () =>
        new Promise((_resolve, reject) => {
          rejectRequest = reject;
        }),
    );

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const listKey = adminCommerceQueryKeys.products.list({ page: 1, size: 10 });
    const translationsKey = adminCommerceQueryKeys.products.translations(7);
    queryClient.setQueryData(listKey, {
      meta: { page: 1, pageSize: 10, pages: 1, total: 1 },
      result: [{ id: 7, name: "Áo linen", status: "DRAFT" }],
    });
    queryClient.setQueryData(translationsKey, {
      translations: [{ localeCode: "vi", name: "Áo linen" }],
    });

    function Wrapper({ children }: { children: ReactNode }) {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    }

    const { result } = renderHook(() => useUpdateAdminProductStatusMutation(), {
      wrapper: Wrapper,
    });
    let mutationPromise: Promise<unknown> | undefined;

    act(() => {
      mutationPromise = result.current.mutateAsync({ id: 7, status: "ACTIVE" });
    });

    await waitFor(() => {
      const page = queryClient.getQueryData<{ result: Array<{ status: string }> }>(listKey);
      expect(page?.result[0].status).toBe("ACTIVE");
      expect(updateAdminProductStatusMock).toHaveBeenCalledWith(7, "ACTIVE");
    });

    await act(async () => {
      rejectRequest?.(new Error("network failed"));
      await mutationPromise?.catch(() => undefined);
    });

    const restored = queryClient.getQueryData<{
      result: Array<{ status: string }>;
    }>(listKey);
    expect(restored?.result[0].status).toBe("DRAFT");
    expect(queryClient.getQueryData(translationsKey)).toEqual({
      translations: [{ localeCode: "vi", name: "Áo linen" }],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["products"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["product"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["sales"] });
  });

  it("invalidates public list/detail/Sale caches after translation and Variant mutations", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    function Wrapper({ children }: { children: ReactNode }) {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    }

    const translationHook = renderHook(
      () => useUpdateAdminProductTranslationsMutation(),
      { wrapper: Wrapper },
    );
    await act(async () => {
      await translationHook.result.current.mutateAsync({
        id: 7,
        request: {
          translations: [
            {
              localeCode: "vi",
              name: "Áo linen",
              slug: "ao-linen",
              shortDescription: null,
              description: null,
              material: null,
              careInstruction: null,
              seoTitle: null,
              seoDescription: null,
            },
          ],
        },
      });
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["products"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["product"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["sales"] });
    invalidateSpy.mockClear();

    const variantHook = renderHook(
      () => useUpdateAdminProductVariantStatusMutation(),
      { wrapper: Wrapper },
    );
    await act(async () => {
      await variantHook.result.current.mutateAsync({ id: 8, status: "ACTIVE" });
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["products"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["product"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["sales"] });
  });

  it("invalidates Category plus public Product list/detail after Category translation", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    function Wrapper({ children }: { children: ReactNode }) {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    }
    const { result } = renderHook(
      () => useUpdateAdminCategoryTranslationsMutation(),
      { wrapper: Wrapper },
    );

    await act(async () => {
      await result.current.mutateAsync({
        id: 3,
        request: {
          translations: [
            {
              localeCode: "vi",
              name: "Áo",
              slug: "ao",
              description: null,
              seoTitle: null,
              seoDescription: null,
            },
          ],
        },
      });
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["categories"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["products"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["product"] });
  });
});
