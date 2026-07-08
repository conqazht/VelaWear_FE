"use client";

import { useLayoutEffect } from "react";

export function AdminThemeEnforcer() {
  useLayoutEffect(() => {
    document.documentElement.setAttribute("data-admin-theme", "true");
    
    // Ensure data-theme-preset is set to default if not present
    if (!document.documentElement.hasAttribute("data-theme-preset")) {
      document.documentElement.setAttribute("data-theme-preset", "default");
    }

    return () => {
      document.documentElement.removeAttribute("data-admin-theme");
      // Remove the preset to avoid bleeding into the storefront
      document.documentElement.removeAttribute("data-theme-preset");
      // Clean up the dark class so storefront isn't affected
      document.documentElement.classList.remove("dark");
    };
  }, []);

  return null;
}
