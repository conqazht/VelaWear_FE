"use client";

import * as React from "react";

import { useI18n } from "@/components/providers/i18n-provider";
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from "@/components/ui/drawer";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useSidebar } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { setClientCookie } from "@/lib/cookie.client";

import { type Mail, mailsByLocale } from "./data";
import { MailInbox } from "./mail-inbox";
import {
  DEFAULT_MAIL_LAYOUT,
  MAIL_DETAIL_PANEL_ID,
  MAIL_LAYOUT_COOKIE,
  MAIL_LIST_PANEL_ID,
} from "./mail-layout-config";
import { MailView } from "./mail-view";
import { useMail } from "./use-mail";

interface MailProps {
  defaultLayout: number[] | undefined;
}

interface MailLayoutProps {
  mails: Mail[];
  defaultLayout?: number[];
}

export function MailComponent({ defaultLayout = [...DEFAULT_MAIL_LAYOUT] }: MailProps) {
  const { locale } = useI18n();
  const mails = mailsByLocale[locale];
  const { isMobile } = useSidebar();
  const isMounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!isMounted) {
    return <MailLoadingSkeleton />;
  }

  return isMobile ? (
    <MailMobileLayout mails={mails} />
  ) : (
    <MailDesktopLayout mails={mails} defaultLayout={defaultLayout} />
  );
}

function MailLoadingSkeleton() {
  return (
    <div
      className="grid size-full min-h-0 overflow-hidden rounded-lg border md:grid-cols-[18rem_1fr]"
      aria-hidden="true"
    >
      <aside className="space-y-4 border-r p-4">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-9 w-full rounded-md" />
        <div className="space-y-2">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="flex gap-3 rounded-md border p-3">
              <Skeleton className="size-9 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className={index % 2 === 0 ? "h-3 w-3/5" : "h-3 w-2/5"} />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
              </div>
            </div>
          ))}
        </div>
      </aside>
      <main className="hidden min-w-0 space-y-6 p-8 md:block">
        <div className="flex items-start justify-between gap-6">
          <div className="space-y-3">
            <Skeleton className="h-7 w-64 max-w-full" />
            <Skeleton className="h-3 w-40" />
          </div>
          <Skeleton className="size-8 rounded-full" />
        </div>
        <div className="bg-border h-px" />
        <div className="space-y-3">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-11/12" />
          <Skeleton className="h-3 w-4/5" />
          <Skeleton className="mt-6 h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </main>
    </div>
  );
}

function MailMobileLayout({ mails }: Pick<MailLayoutProps, "mails">) {
  const { t } = useI18n();
  const [mail] = useMail();
  const [isMailOpen, setIsMailOpen] = React.useState(false);
  const selectedMail = mails.find((item) => item.id === mail.selected) || null;

  return (
    <>
      <MailInbox mails={mails} onSelectMail={() => setIsMailOpen(true)} />

      <Drawer open={isMailOpen} onOpenChange={setIsMailOpen}>
        <DrawerContent>
          <DrawerTitle className="sr-only">
            {t("admin.communications.mail.drawer.title")}
          </DrawerTitle>
          <DrawerDescription className="sr-only">
            {t("admin.communications.mail.drawer.description")}
          </DrawerDescription>
          <MailView mail={selectedMail} onClose={() => setIsMailOpen(false)} />
        </DrawerContent>
      </Drawer>
    </>
  );
}

function MailDesktopLayout({ mails, defaultLayout = [...DEFAULT_MAIL_LAYOUT] }: MailLayoutProps) {
  const [mail] = useMail();

  return (
    <ResizablePanelGroup
      orientation="horizontal"
      onLayoutChanged={(layout) => {
        const sizes = [layout[MAIL_LIST_PANEL_ID], layout[MAIL_DETAIL_PANEL_ID]];
        setClientCookie(MAIL_LAYOUT_COOKIE, JSON.stringify(sizes));
      }}
      className="h-full"
    >
      <ResizablePanel
        id={MAIL_LIST_PANEL_ID}
        defaultSize={`${defaultLayout[0]}%`}
        minSize="30%"
        className="min-h-0"
      >
        <MailInbox mails={mails} />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel
        id={MAIL_DETAIL_PANEL_ID}
        defaultSize={`${defaultLayout[1]}%`}
        minSize="30%"
        className="min-h-0"
      >
        <MailView mail={mails.find((item) => item.id === mail.selected) || null} />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
