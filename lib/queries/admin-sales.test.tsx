import type { ReactNode } from "react";
import { act, renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

const { updateAdminSaleCampaignTranslationsMock } = vi.hoisted(() => ({
  updateAdminSaleCampaignTranslationsMock: vi.fn(),
}));

vi.mock("@/lib/api/admin-sales", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/admin-sales")>();
  return {
    ...actual,
    updateAdminSaleCampaignTranslations: updateAdminSaleCampaignTranslationsMock,
  };
});

import { useUpdateAdminSaleCampaignTranslationsMutation } from "@/lib/queries/admin-sales";

describe("admin Sale public cache invalidation", () => {
  it("invalidates Sale and Product list/detail after a Sale mutation", async () => {
    updateAdminSaleCampaignTranslationsMock.mockResolvedValue({
      version: 2,
      translations: [],
    });
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    function Wrapper({ children }: { children: ReactNode }) {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    }
    const { result } = renderHook(
      () => useUpdateAdminSaleCampaignTranslationsMutation(),
      { wrapper: Wrapper },
    );

    await act(async () => {
      await result.current.mutateAsync({
        id: 5,
        request: {
          version: 1,
          translations: [
            { localeCode: "vi", name: "Sale hè", description: null },
          ],
        },
      });
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["sales"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["products"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["product"] });
  });
});
