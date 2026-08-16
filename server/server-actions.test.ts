import { beforeEach, describe, expect, it, vi } from "vitest";

const { cookiesMock } = vi.hoisted(() => ({
  cookiesMock: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: cookiesMock,
}));

vi.mock("@/lib/fonts/registry", () => ({
  fontKeys: ["geist"] as const,
}));

import { getPreference } from "@/server/server-actions";

describe("getPreference", () => {
  beforeEach(() => {
    cookiesMock.mockReset();
  });

  it("reads the persisted theme_mode cookie", async () => {
    const get = vi.fn((key: string) => (key === "theme_mode" ? { value: "dark" } : undefined));
    cookiesMock.mockResolvedValue({ get });

    await expect(getPreference("theme_mode")).resolves.toBe("dark");
    expect(get).toHaveBeenCalledWith("theme_mode");
  });

  it("falls back to system for an invalid theme_mode cookie", async () => {
    cookiesMock.mockResolvedValue({
      get: vi.fn(() => ({ value: "sepia" })),
    });

    await expect(getPreference("theme_mode")).resolves.toBe("system");
  });
});
