import type { ReactNode } from "react";
import { connection } from "next/server";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PREFERENCE_DEFAULTS } from "@/lib/preferences/preferences-config";
import { getPreference } from "@/server/server-actions";
import { PreferencesStoreProvider } from "@/stores/preferences/preferences-provider";
import { I18nCatalogProvider } from "@/components/providers/i18n-provider";
import { adminMessages } from "@/lib/i18n/messages/catalog-admin";

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
    <I18nCatalogProvider messages={adminMessages}>
      <TooltipProvider>
        <AdminThemeEnforcer themeMode={themeMode} />
        <PreferencesStoreProvider initialValues={initialPreferences}>
          <AdminAuthGate>{children}</AdminAuthGate>
          <AdminToaster />
        </PreferencesStoreProvider>
      </TooltipProvider>
    </I18nCatalogProvider>
  );
}
