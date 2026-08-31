import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/fonts/registry", () => ({
  fontKeys: ["geist"] as const,
}));

import { PREFERENCE_DEFAULTS, parsePreference } from "@/lib/preferences/preferences-config";

describe("theme preference defaults", () => {
  it("defaults missing and invalid theme modes to light", () => {
    expect(PREFERENCE_DEFAULTS.theme_mode).toBe("light");
    expect(parsePreference("theme_mode", undefined)).toBe("light");
    expect(parsePreference("theme_mode", null)).toBe("light");
    expect(parsePreference("theme_mode", "")).toBe("light");
    expect(parsePreference("theme_mode", "sepia")).toBe("light");
  });

  it("preserves explicit light and dark preferences", () => {
    expect(parsePreference("theme_mode", "light")).toBe("light");
    expect(parsePreference("theme_mode", "dark")).toBe("dark");
    expect(parsePreference("theme_mode", "system")).toBe("system");
  });
});
