"use client";

import {
  Banknote,
  ChevronRight,
  Droplet,
  History,
  Lightbulb,
  MoreHorizontal,
  QrCode,
  SendHorizontal,
  Smartphone,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";

const contacts = [
  { id: 1, initials: "AR" },
  { id: 2, initials: "SC" },
  { id: 3, initials: "MJ" },
  { id: 4, initials: "ED" },
];

const shortcuts = [
  { id: 1, labelKey: "admin.finance.quick.scanQr", icon: QrCode },
  { id: 2, labelKey: "admin.finance.quick.transfer", icon: SendHorizontal },
  { id: 3, labelKey: "admin.finance.quick.payBills", icon: Banknote },
  { id: 4, labelKey: "admin.finance.quick.history", icon: History },
  { id: 5, labelKey: "admin.finance.quick.mobile", icon: Smartphone },
  { id: 6, labelKey: "admin.finance.quick.electricity", icon: Lightbulb },
  { id: 7, labelKey: "admin.finance.quick.water", icon: Droplet },
  { id: 8, labelKey: "admin.finance.quick.more", icon: MoreHorizontal },
] as const;

export function QuickActions() {
  const { t } = useI18n();

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="font-normal">{t("admin.finance.quick.transferTitle")}</CardTitle>
          <CardAction>
            <div className="flex items-center gap-1">
              <div className="flex -space-x-2">
                {contacts.map((contact) => (
                  <Avatar key={contact.id} className="border-background size-7 border-2">
                    <AvatarFallback className="text-[10px]">{contact.initials}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <ChevronRight className="size-4" />
            </div>
          </CardAction>
        </CardHeader>
        <CardContent>
          <Field orientation="horizontal">
            <InputGroup>
              <InputGroupAddon>
                <InputGroupText>$</InputGroupText>
              </InputGroupAddon>
              <InputGroupInput placeholder="0.00" aria-label={t("admin.finance.quick.amount")} />
              <InputGroupAddon align="inline-end">
                <InputGroupText>USD</InputGroupText>
              </InputGroupAddon>
            </InputGroup>
            <Button>{t("admin.finance.quick.send")}</Button>
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-normal">{t("admin.finance.quick.shortcuts")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {shortcuts.map((shortcut) => {
              const Icon = shortcut.icon;
              return (
                <div key={shortcut.id} className="flex flex-col items-center gap-2.5">
                  <Button
                    variant="outline"
                    className="size-12 rounded-full"
                    aria-label={t(shortcut.labelKey)}
                  >
                    <Icon className="size-5" />
                  </Button>
                  <span className="text-muted-foreground text-center text-xs">
                    {t(shortcut.labelKey)}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
