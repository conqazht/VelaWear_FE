"use client";

import { useLayoutEffect } from "react";

import type { ThemeMode } from "@/lib/preferences/theme";
import { applyThemeMode } from "@/lib/preferences/theme-utils";

export function AdminThemeEnforcer({ themeMode }: { themeMode: ThemeMode }) {
  useLayoutEffect(() => {
    const root = document.documentElement;

    root.setAttribute("data-admin-theme", "true");

    // Ensure data-theme-preset is set to default if not present
    if (!root.hasAttribute("data-theme-preset")) {
      root.setAttribute("data-theme-preset", "default");
    }

    // Apply active theme mode (light / dark / system)
    applyThemeMode(themeMode);

    return () => {
      root.removeAttribute("data-admin-theme");
      // Remove the preset to avoid bleeding into the storefront
      root.removeAttribute("data-theme-preset");
      root.removeAttribute("data-theme-mode");
      // Clean up admin color mode so the fixed-light storefront isn't affected.
      root.classList.remove("dark", "disable-transitions");
      root.style.removeProperty("color-scheme");
    };
  }, [themeMode]);

  return null;
}
