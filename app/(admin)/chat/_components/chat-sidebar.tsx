"use client";

import { EllipsisVertical, LogOut, Settings, UserRound } from "lucide-react";
import { siFacebook, siInstagram, siWhatsapp } from "simple-icons";

import { SimpleIcon } from "@/components/simple-icon";
import { useI18n } from "@/components/providers/i18n-provider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { getInitials } from "@/lib/utils";

import { channelItems, currentUser, navItems, viewItems } from "./data";

const channelBrandIcons = {
  whatsapp: siWhatsapp,
  instagram: siInstagram,
  facebook: siFacebook,
} as const;

const NAV_MESSAGE_KEYS = {
  inbox: "admin.communications.chat.sidebar.inbox",
  mentions: "admin.communications.chat.sidebar.mentions",
  snoozed: "admin.communications.chat.sidebar.snoozed",
  sent: "admin.communications.chat.sidebar.sent",
  all: "admin.communications.chat.sidebar.all",
  unassigned: "admin.communications.chat.sidebar.unassigned",
} as const;

const CHANNEL_MESSAGE_KEYS = {
  email: "admin.communications.chat.sidebar.email",
  chat: "admin.communications.chat.sidebar.chat",
  whatsapp: "admin.communications.chat.sidebar.whatsapp",
  instagram: "admin.communications.chat.sidebar.instagram",
  facebook: "admin.communications.chat.sidebar.facebook",
  phone: "admin.communications.chat.sidebar.phone",
} as const;

const VIEW_MESSAGE_KEYS = {
  vip: "admin.communications.chat.sidebar.vip",
  orders: "admin.communications.chat.sidebar.orders",
  feedback: "admin.communications.chat.sidebar.feedback",
} as const;

export function ChatSidebar() {
  const { t } = useI18n();

  return (
    <Sidebar
      collapsible="offcanvas"
      className="**:data-[sidebar=sidebar]:bg-background top-(--header-height) h-[calc(100svh-var(--header-height))]!"
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-1">
            {navItems.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  className="[&_svg]:size-3.5"
                  size="sm"
                  isActive={item.isActive}
                  tooltip={t(NAV_MESSAGE_KEYS[item.id as keyof typeof NAV_MESSAGE_KEYS])}
                >
                  <item.icon />
                  <span className="font-medium">
                    {t(NAV_MESSAGE_KEYS[item.id as keyof typeof NAV_MESSAGE_KEYS])}
                  </span>
                </SidebarMenuButton>
                {item.label && (
                  <SidebarMenuBadge className="font-medium">{item.label}</SidebarMenuBadge>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="font-normal">
            {t("admin.communications.chat.sidebar.channels")}
          </SidebarGroupLabel>
          <SidebarMenu className="gap-1">
            {channelItems.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  className="[&_svg]:size-3.5"
                  size="sm"
                  isActive={item.isActive}
                  tooltip={t(CHANNEL_MESSAGE_KEYS[item.id as keyof typeof CHANNEL_MESSAGE_KEYS])}
                >
                  {item.id in channelBrandIcons ? (
                    <SimpleIcon
                      icon={channelBrandIcons[item.id as keyof typeof channelBrandIcons]}
                    />
                  ) : (
                    <item.icon />
                  )}
                  <span className="font-medium">
                    {t(CHANNEL_MESSAGE_KEYS[item.id as keyof typeof CHANNEL_MESSAGE_KEYS])}
                  </span>
                </SidebarMenuButton>
                {item.label && (
                  <SidebarMenuBadge className="font-medium">{item.label}</SidebarMenuBadge>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="font-normal">
            {t("admin.communications.chat.sidebar.views")}
          </SidebarGroupLabel>
          <SidebarMenu className="gap-1">
            {viewItems.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  className="[&_svg]:size-3.5"
                  size="sm"
                  isActive={item.isActive}
                  tooltip={t(VIEW_MESSAGE_KEYS[item.id as keyof typeof VIEW_MESSAGE_KEYS])}
                >
                  <item.icon />
                  <span className="font-medium">
                    {t(VIEW_MESSAGE_KEYS[item.id as keyof typeof VIEW_MESSAGE_KEYS])}
                  </span>
                </SidebarMenuButton>
                {item.label && (
                  <SidebarMenuBadge className="font-medium">{item.label}</SidebarMenuBadge>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <Separator />
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  />
                }
              >
                <Avatar>
                  <AvatarFallback className="text-xs">
                    {getInitials(currentUser.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{currentUser.name}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {currentUser.email}
                  </span>
                </div>
                <EllipsisVertical className="ml-auto size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56"
                side="top"
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar>
                      <AvatarFallback className="text-xs">
                        {getInitials(currentUser.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{currentUser.name}</span>
                      <span className="text-muted-foreground truncate text-xs">
                        {currentUser.email}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <UserRound />
                    {t("admin.communications.chat.sidebar.account")}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings />
                    {t("admin.communications.chat.settings")}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut />
                  {t("admin.communications.chat.sidebar.logOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
