import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createThemeBootstrapScript } from "@/lib/preferences/theme-bootstrap";
import type { ThemeMode } from "@/lib/preferences/theme";

function mockSystemTheme(prefersDark: boolean) {
  vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: prefersDark }));
}

function runBootstrap(mode: ThemeMode) {
  Function(createThemeBootstrapScript(mode))();
}

describe("theme bootstrap", () => {
  beforeEach(() => {
    const root = document.documentElement;
    root.removeAttribute("data-theme-mode");
    root.classList.remove("dark");
    root.style.removeProperty("color-scheme");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it.each([
    { prefersDark: false, expectedMode: "light" },
    { prefersDark: true, expectedMode: "dark" },
  ])("resolves system mode before paint", ({ prefersDark, expectedMode }) => {
    mockSystemTheme(prefersDark);

    runBootstrap("system");

    const root = document.documentElement;
    expect(root).toHaveAttribute("data-theme-mode", "system");
    expect(root.classList.contains("dark")).toBe(expectedMode === "dark");
    expect(root.style.colorScheme).toBe(expectedMode);
  });

  it("keeps explicit light even when the system is dark", () => {
    mockSystemTheme(true);

    runBootstrap("light");

    const root = document.documentElement;
    expect(root).toHaveAttribute("data-theme-mode", "light");
    expect(root).not.toHaveClass("dark");
    expect(root.style.colorScheme).toBe("light");
  });

  it("keeps explicit dark even when the system is light", () => {
    mockSystemTheme(false);

    runBootstrap("dark");

    const root = document.documentElement;
    expect(root).toHaveAttribute("data-theme-mode", "dark");
    expect(root).toHaveClass("dark");
    expect(root.style.colorScheme).toBe("dark");
  });
});
