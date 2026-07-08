import type { ReactNode } from "react";
import { connection } from "next/server";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PREFERENCE_DEFAULTS } from "@/lib/preferences/preferences-config";
import { PreferencesStoreProvider } from "@/stores/preferences/preferences-provider";

import { AdminThemeEnforcer } from "./_components/admin-theme-enforcer";

export default async function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
  await connection();
  return (
    <TooltipProvider>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.documentElement.setAttribute("data-admin-theme", "true");
            if (!document.documentElement.hasAttribute("data-theme-preset")) {
              document.documentElement.setAttribute("data-theme-preset", "default");
            }
            try {
              let mode = null;
              const match = document.cookie.match(/(?:^|; )data-theme-mode=([^;]*)/);
              if (match) mode = decodeURIComponent(match[1]);
              if (!mode || mode === 'system') {
                if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } else if (mode === 'dark') {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            } catch(e) {}
          `.replace(/\n/g, ''),
        }}
      />
      <AdminThemeEnforcer />
      <PreferencesStoreProvider initialValues={PREFERENCE_DEFAULTS}>
        {children}
        <Toaster />
      </PreferencesStoreProvider>
    </TooltipProvider>
  );
}
