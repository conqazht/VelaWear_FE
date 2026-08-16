"use client";

import * as React from "react";

import {
  Check,
  EllipsisVertical,
  LogOut,
  PenLine,
  Settings2,
  UserPlus,
  UsersRound,
} from "lucide-react";

import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
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
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn, getInitials } from "@/lib/utils";

import { accounts, type MailNavItem, mailNavigation } from "./data";

const MAIL_NAV_MESSAGE_KEYS = {
  inbox: "admin.communications.mail.sidebar.inbox",
  priority: "admin.communications.mail.sidebar.priority",
  drafts: "admin.communications.mail.sidebar.drafts",
  sent: "admin.communications.mail.sidebar.sent",
  archive: "admin.communications.mail.sidebar.archive",
  trash: "admin.communications.mail.sidebar.trash",
  "help-feedback": "admin.communications.mail.sidebar.help",
  "keyboard-shortcuts": "admin.communications.mail.sidebar.shortcuts",
} as const;

export function MailSidebar() {
  const { t } = useI18n();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [selectedAccount, setSelectedAccount] = React.useState(accounts[0]);

  return (
    <Sidebar
      collapsible="icon"
      className="**:data-[sidebar=sidebar]:bg-background absolute inset-y-0 h-full"
    >
      <SidebarHeader className="gap-3 py-3 pb-1">
        <div className="flex items-center justify-between">
          {isCollapsed ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className={accountTriggerClassName}
                    aria-label={t("admin.communications.mail.sidebar.openAccount", {
                      account: selectedAccount.label,
                    })}
                  />
                }
              >
                <AccountMarker account={selectedAccount} isSelected />
              </DropdownMenuTrigger>
              <AccountMenuContent
                selectedAccountId={selectedAccount.id}
                onSelectAccount={setSelectedAccount}
                showAccounts
                side="right"
                align="start"
              />
            </DropdownMenu>
          ) : (
            <>
              <ToggleGroup
                value={[String(selectedAccount.id)]}
                onValueChange={(value) => {
                  const account = accounts.find((item) => item.id === Number(value[0]));

                  if (account) {
                    setSelectedAccount(account);
                  }
                }}
                spacing={2}
              >
                {accounts.map((account) => (
                  <ToggleGroupItem
                    key={account.id}
                    className={accountTriggerClassName}
                    value={String(account.id)}
                    aria-label={t("admin.communications.mail.sidebar.selectAccount", {
                      account: account.label,
                    })}
                  >
                    <AccountMarker account={account} />
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={t("admin.communications.mail.sidebar.openAccountMenu")}
                    />
                  }
                >
                  <EllipsisVertical />
                </DropdownMenuTrigger>
                <AccountMenuContent
                  selectedAccountId={selectedAccount.id}
                  onSelectAccount={setSelectedAccount}
                />
              </DropdownMenu>
            </>
          )}
        </div>

        <Separator />

        <div className="flex flex-col gap-1.5 group-data-[state=collapsed]:hidden">
          <div className="text-sm leading-none font-medium">{selectedAccount.label}</div>
          <div className="text-muted-foreground truncate text-sm leading-none">
            {selectedAccount.email}
          </div>
        </div>

        <Button
          size={isCollapsed ? "icon-sm" : "sm"}
          variant="outline"
          className="group-data-[state=expanded]:w-full"
        >
          <PenLine data-icon="inline-start" />
          <span className="group-data-[state=collapsed]:hidden">
            {t("admin.communications.mail.sidebar.newEmail")}
          </span>
        </Button>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-1">
            {mailNavigation.navMain.map((item) => renderNavItem(item, t))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="font-normal">
            {t("admin.communications.mail.sidebar.folders")}
          </SidebarGroupLabel>
          <SidebarMenu className="gap-1">
            {mailNavigation.folders.map((item) => renderNavItem(item, t))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu className="gap-1">
          {mailNavigation.navFooter.map((item) => renderNavItem(item, t))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function renderNavItem(nav: MailNavItem, t: ReturnType<typeof useI18n>["t"]) {
  const label = t(MAIL_NAV_MESSAGE_KEYS[nav.id as keyof typeof MAIL_NAV_MESSAGE_KEYS]);

  return (
    <SidebarMenuItem key={nav.id}>
      <SidebarMenuButton
        className="[&_svg]:size-3.5"
        size="sm"
        isActive={nav.isActive}
        tooltip={label}
      >
        <nav.icon />
        <span className="font-medium">{label}</span>
      </SidebarMenuButton>
      {nav.label && <SidebarMenuBadge className="font-medium">{nav.label}</SidebarMenuBadge>}
    </SidebarMenuItem>
  );
}

const accountTriggerClassName = cn(
  "relative size-7 min-w-7 rounded-sm p-0 transition-colors",
  "bg-primary text-primary-foreground text-xs hover:bg-primary/90 hover:text-primary-foreground",
  "aria-pressed:bg-primary aria-pressed:text-primary-foreground",
  "aria-pressed:ring aria-pressed:ring-green-600",
  "focus-visible:border-transparent focus-visible:ring-0",
);

type Account = (typeof accounts)[number];

function AccountMarker({
  account,
  isSelected = false,
}: {
  account: Account;
  isSelected?: boolean;
}) {
  return (
    <>
      {getInitials(account.label).slice(0, 1)}
      <span
        className={cn(
          "text-primary-foreground ring-background absolute right-0 bottom-0 z-10 hidden size-2.5 items-center justify-center rounded-full bg-green-600 ring-[1.25px] group-aria-pressed/toggle:flex",
          isSelected && "flex",
        )}
      >
        <Check className="size-2" />
      </span>
    </>
  );
}

function AccountMenuContent({
  selectedAccountId,
  onSelectAccount,
  showAccounts = false,
  ...props
}: {
  selectedAccountId: number;
  onSelectAccount: (account: Account) => void;
  showAccounts?: boolean;
} & Pick<React.ComponentProps<typeof DropdownMenuContent>, "align" | "side">) {
  const { t } = useI18n();

  return (
    <DropdownMenuContent className="w-56" {...props}>
      {showAccounts && (
        <>
          <DropdownMenuGroup>
            <DropdownMenuLabel>{t("admin.communications.mail.sidebar.accounts")}</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={String(selectedAccountId)}
              onValueChange={(value) => {
                const account = accounts.find((item) => item.id === Number(value));

                if (account) {
                  onSelectAccount(account);
                }
              }}
            >
              {accounts.map((account) => (
                <DropdownMenuRadioItem key={account.id} value={String(account.id)} closeOnClick>
                  <div className="flex min-w-0 flex-col">
                    <span>{account.label}</span>
                    <span className="text-muted-foreground truncate text-xs">{account.email}</span>
                  </div>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
        </>
      )}
      <DropdownMenuGroup>
        <DropdownMenuItem>
          <UserPlus />
          {t("admin.communications.mail.sidebar.addAccount")}
        </DropdownMenuItem>
        <DropdownMenuItem>
          <UsersRound />
          {t("admin.communications.mail.sidebar.manageAccounts")}
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings2 />
          {t("admin.communications.mail.sidebar.accountSettings")}
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem>
          <LogOut />
          {t("admin.communications.mail.sidebar.signOut")}
        </DropdownMenuItem>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  );
}
