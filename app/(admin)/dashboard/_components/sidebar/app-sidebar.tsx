"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Store } from "lucide-react";
import { toast } from "sonner";
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
    const toastId = toast.loading(t("admin.shell.account.loggingOut"));
    try {
      await signOut();
      toast.dismiss(toastId);
      router.push("/sign-in");
    } catch {
      toast.error(t("admin.shell.account.logoutError"), { id: toastId });
    }
  }

  return (
    <Sidebar {...props} variant={variant} collapsible={collapsible}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton render={<Link href="/dashboard/ecommerce" />}>
              <Image
                src="/images/brand/vela-wear-logo.png"
                alt={t("admin.shell.brand")}
                width={20}
                height={20}
                className="size-5 dark:invert"
              />
              <span className="text-base font-semibold">{t("admin.shell.brand")}</span>
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
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link href="/" />}
              tooltip={t("admin.shell.navigation.storefront")}
            >
              <Store />
              <span>{t("admin.shell.navigation.storefront")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <NavUser user={sidebarUser} onLogout={() => void handleLogout()} />
      </SidebarFooter>
    </Sidebar>
  );
}
