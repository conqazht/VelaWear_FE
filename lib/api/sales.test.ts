import { beforeEach, describe, expect, it, vi } from "vitest";

const { apiGetMock } = vi.hoisted(() => ({
  apiGetMock: vi.fn(),
}));

vi.mock("@/lib/api/client", () => ({
  apiGet: apiGetMock,
}));

import { getPublicSales } from "@/lib/api/sales";
import { saleQueryKeys } from "@/lib/queries/sales";

describe("public sales API", () => {
  beforeEach(() => {
    apiGetMock.mockReset();
    apiGetMock.mockResolvedValue({
      serverTime: "2026-07-15T00:00:00.000Z",
      campaigns: [],
    });
  });

  it("serialize phase thành query lặp để Spring bind vào List", async () => {
    await getPublicSales({
      type: "FLASH",
      phase: ["LIVE", "UPCOMING"],
    });

    expect(apiGetMock).toHaveBeenCalledWith(
      "/sales?type=FLASH&phase=LIVE&phase=UPCOMING",
    );
  });

  it("gửi locale trong API và tách cache key Sale theo locale", async () => {
    await getPublicSales({ type: "FLASH", locale: "en" });

    expect(apiGetMock).toHaveBeenCalledWith("/sales?type=FLASH&locale=en");
    expect(saleQueryKeys.list({ type: "FLASH", locale: "en" })).toEqual([
      "sales",
      "list",
      { type: "FLASH", locale: "en" },
    ]);
    expect(saleQueryKeys.list({ type: "FLASH", locale: "vi" })).not.toEqual(
      saleQueryKeys.list({ type: "FLASH", locale: "en" }),
    );
  });
});
