"use client";

import { Moon, Sun } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { usePreferencesStore } from "@/stores/preferences/preferences-provider";

const THEME_LABEL_KEYS = {
  light: "admin.shell.preferences.light",
  dark: "admin.shell.preferences.dark",
} as const;

export function ThemeSwitcher() {
  const { t } = useI18n();
  const { themeMode, setPreference } = usePreferencesStore(
    useShallow((state) => ({
      themeMode: state.values.theme_mode,
      setPreference: state.setPreference,
    })),
  );

  const cycleTheme = () => {
    const isDark = themeMode === "dark";
    setPreference("theme_mode", isDark ? "light" : "dark");
  };

  const isDark = themeMode === "dark";

  return (
    <Button
      variant="outline"
      size="icon"
      className="rounded-full"
      onClick={cycleTheme}
      aria-label={t("admin.shell.theme.current", {
        theme: t(isDark ? THEME_LABEL_KEYS.dark : THEME_LABEL_KEYS.light),
      })}
    >
      {/* When in dark mode, show Sun icon to switch to light */}
      <Sun className="hidden size-4 dark:block" />

      {/* When in light mode, show Moon icon to switch to dark */}
      <Moon className="block size-4 dark:hidden" />
    </Button>
  );
}
