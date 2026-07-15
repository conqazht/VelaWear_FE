"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Command } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { resolveAdminAssetUrl } from "@/app/(admin)/dashboard/_components/management/resource-utils";
import { useAuth } from "@/components/auth/auth-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { sidebarItems } from "@/navigation/sidebar/sidebar-items";
import { usePreferencesStore } from "@/stores/preferences/preferences-provider";

import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { t } = useI18n();
  const { sidebarVariant, sidebarCollapsible, isSynced } = usePreferencesStore(
    useShallow((s) => ({
      sidebarVariant: s.values.sidebar_variant,
      sidebarCollapsible: s.values.sidebar_collapsible,
      isSynced: s.isSynced,
    })),
  );

  const variant = isSynced ? sidebarVariant : props.variant;
  const collapsible = isSynced ? sidebarCollapsible : props.collapsible;
  const sidebarUser = {
    name: user?.fullName ?? t("admin.shell.brand"),
    email: user?.email ?? "",
    avatar: resolveAdminAssetUrl(user?.avatar) ?? "",
  };

  async function handleLogout() {
    await signOut();
    router.push("/sign-in");
  }

  return (
    <Sidebar {...props} variant={variant} collapsible={collapsible}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton render={<Link href="/dashboard/default" />}>
              <Command />
              <span className="font-semibold text-base">{t("admin.shell.brand")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarItems} />
        {/* <NavDocuments items={data.documents} /> */}
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarUser} onLogout={() => void handleLogout()} />
      </SidebarFooter>
    </Sidebar>
  );
}
