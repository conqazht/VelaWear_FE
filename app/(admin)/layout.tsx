import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
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

export const metadata: Metadata = {
  title: {
    template: "%s | VELA WEAR Admin",
    default: "Admin Portal | VELA WEAR",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <I18nCatalogProvider messages={adminMessages}>
      <TooltipProvider>
        <Suspense fallback={<AdminLayoutSkeleton />}>
          <AdminPreferencesProviders>{children}</AdminPreferencesProviders>
        </Suspense>
      </TooltipProvider>
    </I18nCatalogProvider>
  );
}

function AdminLayoutSkeleton() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/10">
      <div className="size-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

async function AdminPreferencesProviders({ children }: { children: ReactNode }) {
  await connection();
  const themeMode = await getPreference("theme_mode");
  const initialPreferences = {
    ...PREFERENCE_DEFAULTS,
    theme_mode: themeMode,
  };

  return (
    <>
      <AdminThemeEnforcer themeMode={themeMode} />
      <PreferencesStoreProvider initialValues={initialPreferences}>
        <AdminAuthGate>{children}</AdminAuthGate>
        <AdminToaster />
      </PreferencesStoreProvider>
    </>
  );
}
