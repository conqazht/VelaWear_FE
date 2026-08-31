import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AdminThemeEnforcer } from "@/app/(admin)/_components/admin-theme-enforcer";

describe("AdminThemeEnforcer", () => {
  beforeEach(() => {
    const root = document.documentElement;
    root.removeAttribute("data-admin-theme");
    root.removeAttribute("data-theme-mode");
    root.removeAttribute("data-theme-preset");
    root.classList.remove("dark", "disable-transitions");
    root.style.removeProperty("color-scheme");

    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("enforces light mode on mount and cleans up admin theme state on unmount", () => {
    const { unmount } = render(<AdminThemeEnforcer themeMode="light" />);
    const root = document.documentElement;

    expect(root).toHaveAttribute("data-admin-theme", "true");
    expect(root).toHaveAttribute("data-theme-preset", "default");
    expect(root).toHaveAttribute("data-theme-mode", "light");
    expect(root).not.toHaveClass("dark");
    expect(root.style.colorScheme).toBe("light");

    unmount();

    expect(root).not.toHaveAttribute("data-admin-theme");
    expect(root).not.toHaveAttribute("data-theme-preset");
    expect(root).not.toHaveAttribute("data-theme-mode");
    expect(root).not.toHaveClass("dark");
    expect(root.style.colorScheme).toBe("");
  });
});
