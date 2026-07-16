import type { ReactNode } from "react";
import { connection } from "next/server";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PREFERENCE_DEFAULTS } from "@/lib/preferences/preferences-config";
import { createThemeBootstrapScript } from "@/lib/preferences/theme-bootstrap";
import { getPreference } from "@/server/server-actions";
import { PreferencesStoreProvider } from "@/stores/preferences/preferences-provider";

import { AdminThemeEnforcer } from "./_components/admin-theme-enforcer";
import { AdminAuthGate } from "./_components/admin-auth-gate";
import { AdminToaster } from "./_components/admin-toaster";

export default async function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
  await connection();
  const themeMode = await getPreference("theme_mode");
  const initialPreferences = {
    ...PREFERENCE_DEFAULTS,
    theme_mode: themeMode,
  };

  return (
    <TooltipProvider>
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.setAttribute("data-admin-theme","true");if(!document.documentElement.hasAttribute("data-theme-preset")){document.documentElement.setAttribute("data-theme-preset","default")}${createThemeBootstrapScript(themeMode)}`,
        }}
      />
      <AdminThemeEnforcer themeMode={themeMode} />
      <PreferencesStoreProvider initialValues={initialPreferences}>
        <AdminAuthGate>{children}</AdminAuthGate>
        <AdminToaster />
      </PreferencesStoreProvider>
    </TooltipProvider>
  );
}
