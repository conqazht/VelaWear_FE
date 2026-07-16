import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  clearRevokedSession: vi.fn(),
  replace: vi.fn(),
}));

vi.mock("@/components/auth/auth-provider", () => ({
  useAuth: () => ({ clearRevokedSession: mocks.clearRevokedSession }),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace }),
}));

import { useReauthenticationRedirect } from "@/components/auth/use-reauthentication-redirect";

describe("useReauthenticationRedirect", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.clearRevokedSession.mockResolvedValue(undefined);
  });

  it("xóa auth state cục bộ trước khi replace sang sign-in", async () => {
    const order: string[] = [];
    mocks.clearRevokedSession.mockImplementation(async () => {
      order.push("clear");
    });
    mocks.replace.mockImplementation(() => {
      order.push("redirect");
    });
    const { result } = renderHook(() => useReauthenticationRedirect());

    await act(async () => {
      await result.current();
    });

    expect(mocks.clearRevokedSession).toHaveBeenCalledOnce();
    expect(mocks.replace).toHaveBeenCalledWith("/sign-in");
    expect(order).toEqual(["clear", "redirect"]);
  });

  it("vẫn redirect nếu local query cleanup thất bại", async () => {
    mocks.clearRevokedSession.mockRejectedValue(new Error("cleanup failed"));
    const { result } = renderHook(() => useReauthenticationRedirect());

    await act(async () => {
      await expect(result.current()).rejects.toThrow("cleanup failed");
    });

    expect(mocks.replace).toHaveBeenCalledWith("/sign-in");
  });
});
