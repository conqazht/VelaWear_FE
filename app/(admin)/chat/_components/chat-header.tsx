"use client";

import { Bell, MessageSquarePlus, Search, Settings } from "lucide-react";

import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

export function ChatHeader() {
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-50 flex h-(--header-height) w-full items-center border-b bg-background">
      <div className="flex h-full w-full items-center justify-between gap-3 px-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <h1 className="text-nowrap font-medium text-base">
            {t("admin.communications.chat.title")}
          </h1>
          <InputGroup className="hidden h-7 w-full max-w-sm sm:flex">
            <InputGroupInput
              className="h-7"
              placeholder={t("admin.communications.chat.search")}
            />
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
          </InputGroup>
        </div>
        <div className="flex items-center gap-1">
          <LanguageSwitcher presentation="popover" className="mr-1 size-7" />
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("admin.communications.chat.newConversation")}
          >
            <MessageSquarePlus />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("admin.communications.chat.notifications")}
          >
            <Bell />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("admin.communications.chat.settings")}
          >
            <Settings />
          </Button>
        </div>
      </div>
    </header>
  );
}
