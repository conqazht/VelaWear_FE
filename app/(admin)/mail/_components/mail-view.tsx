"use client";

import {
  Archive,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  EllipsisVertical,
  Forward,
  MailOpen,
  Paperclip,
  Pin,
  Reply,
  ReplyAll,
  Send,
  Smile,
  Tag,
  Trash2,
  X,
} from "lucide-react";

import { useI18n } from "@/components/providers/i18n-provider";
import { SimpleIcon } from "@/components/simple-icon";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDateTime } from "@/lib/i18n/format";
import { cn } from "@/lib/utils";

import type { Mail } from "./data";
import { useMail } from "./use-mail";

interface MailDisplayProps {
  mail: Mail | null;
  onClose?: () => void;
}

export function MailView({ mail, onClose }: MailDisplayProps) {
  const { locale, t } = useI18n();
  const [, setMail] = useMail();

  function handleClose() {
    setMail({ selected: null });
    onClose?.();
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 px-2 py-3">
      <div className="flex items-center">
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={t("admin.communications.mail.view.close")}
                  onClick={handleClose}
                />
              }
            >
              <X />
            </TooltipTrigger>
            <TooltipContent>{t("admin.communications.mail.view.close")}</TooltipContent>
          </Tooltip>
          <Separator className="h-4 data-vertical:self-center" orientation="vertical" />
          <div className="flex items-center gap-0">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={t("admin.communications.mail.view.previous")}
                  />
                }
              >
                <ChevronLeft />
              </TooltipTrigger>
              <TooltipContent>{t("admin.communications.mail.view.previous")}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={t("admin.communications.mail.view.next")}
                  />
                }
              >
                <ChevronRight />
              </TooltipTrigger>
              <TooltipContent>{t("admin.communications.mail.view.next")}</TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={t("admin.communications.mail.view.pin")}
                />
              }
            >
              <Pin />
            </TooltipTrigger>
            <TooltipContent>{t("admin.communications.mail.view.pin")}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={t("admin.communications.mail.view.archive")}
                />
              }
            >
              <Archive />
            </TooltipTrigger>
            <TooltipContent>{t("admin.communications.mail.view.archive")}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={t("admin.communications.mail.view.reply")}
                />
              }
            >
              <Reply />
            </TooltipTrigger>
            <TooltipContent>{t("admin.communications.mail.view.reply")}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <DropdownMenu>
              <TooltipTrigger
                render={
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={t("admin.communications.mail.view.more")}
                      />
                    }
                  />
                }
              >
                <EllipsisVertical />
              </TooltipTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <ReplyAll />
                    {t("admin.communications.mail.view.replyAll")}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Forward />
                    {t("admin.communications.mail.view.forward")}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <MailOpen />
                    {t("admin.communications.mail.view.markUnread")}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Tag />
                    {t("admin.communications.mail.view.addLabel")}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <TooltipContent>{t("admin.communications.mail.view.more")}</TooltipContent>
          </Tooltip>
          <Separator className="h-4 data-vertical:self-center" orientation="vertical" />
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={t("admin.communications.mail.view.trash")}
                />
              }
            >
              <Trash2 className="text-destructive" />
            </TooltipTrigger>
            <TooltipContent>{t("admin.communications.mail.view.trash")}</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <Separator />

      <div className="flex min-h-0 flex-1 flex-col">
        {mail ? (
          <div className="flex min-h-0 flex-1 flex-col gap-3">
            <div className="space-y-1.5">
              <div className="leading-none font-medium">{mail.subject}</div>

              <div className="text-muted-foreground text-xs leading-none">
                {formatDateTime(mail.receivedAt, locale)}
              </div>
            </div>

            <Separator />

            <div className="flex gap-2">
              <Avatar className="size-9 after:rounded-sm">
                <AvatarFallback className="bg-background rounded-sm">
                  {mail.from.name[0]}
                </AvatarFallback>
              </Avatar>

              <div className="flex h-full flex-col gap-1">
                <div className="flex items-center gap-2">
                  <div className="text-xs">{mail.from.name}</div>
                  <Separator className="h-3 data-vertical:self-center" orientation="vertical" />
                  <div className="text-muted-foreground text-xs">{mail.from.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-muted-foreground text-xs">
                    {t("admin.communications.mail.view.to")}{" "}
                    <span className="text-foreground">
                      {mail.to.map((recipient) => recipient.name).join(", ")}
                    </span>
                  </div>

                  {mail.cc?.length ? (
                    <div className="text-muted-foreground text-xs">
                      {t("admin.communications.mail.view.cc")}{" "}
                      <span className="text-foreground">
                        {mail.cc.map((recipient) => recipient.name).join(", ")}
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <Separator />

            {mail.attachments?.length ? (
              <>
                <Collapsible defaultOpen>
                  <CollapsibleTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "group text-muted-foreground p-0 font-normal",
                          "hover:text-muted-foreground hover:bg-transparent dark:hover:bg-transparent",
                          "data-[state=open]:text-muted-foreground data-[state=open]:bg-transparent",
                        )}
                      />
                    }
                  >
                    {t("admin.communications.mail.view.attachments", {
                      count: mail.attachments.length,
                    })}
                    <ChevronDown className="group-data-[state=open]:rotate-180" />
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="flex flex-wrap gap-2">
                      {mail.attachments.map((attachment) => (
                        <Button size="xs" variant="secondary" key={attachment.id}>
                          <SimpleIcon icon={attachment.icon} className="size-3 fill-current" />
                          <span className="font-normal">{attachment.name}</span>
                          <span className="text-muted-foreground font-normal">
                            {attachment.size}
                          </span>
                        </Button>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                <Separator className="my-2" />
              </>
            ) : null}

            <div className="min-h-0 flex-1 scrollbar-none overflow-y-auto text-sm whitespace-pre-wrap">
              {mail.body}
            </div>

            <div className="mt-auto flex flex-col gap-3">
              <Separator />
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <Reply />
                </InputGroupAddon>
                <InputGroupInput
                  className="text-xs"
                  placeholder={t("admin.communications.mail.view.replyPlaceholder", {
                    name: mail.from.name,
                  })}
                />
                <InputGroupAddon className="gap-1" align="inline-end">
                  <InputGroupButton
                    variant="ghost"
                    aria-label={t("admin.communications.mail.view.emoji")}
                  >
                    <Smile />
                  </InputGroupButton>
                  <InputGroupButton
                    variant="ghost"
                    aria-label={t("admin.communications.mail.view.attach")}
                  >
                    <Paperclip />
                  </InputGroupButton>
                  <InputGroupButton
                    variant="ghost"
                    aria-label={t("admin.communications.mail.view.send")}
                  >
                    <Send />
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </div>
          </div>
        ) : (
          <div className="text-muted-foreground grid h-full place-items-center text-sm">
            {t("admin.communications.mail.view.empty")}
          </div>
        )}
      </div>
    </div>
  );
}
