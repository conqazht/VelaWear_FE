"use client";

import { Toaster } from "@/components/ui/sonner";
import { usePreferencesStore } from "@/stores/preferences/preferences-provider";

export function AdminToaster() {
  const theme = usePreferencesStore((state) => state.resolvedThemeMode);

  return <Toaster theme={theme} />;
}
