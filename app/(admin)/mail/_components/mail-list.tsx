"use client";

import { useI18n } from "@/components/providers/i18n-provider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getIntlLocale, type Locale } from "@/lib/i18n";
import { formatDate } from "@/lib/i18n/format";
import { cn } from "@/lib/utils";

import type { Mail } from "./data";
import { useMail } from "./use-mail";

type MailGroup = {
  id: string;
  title: string;
  items: Mail[];
};

interface MailListProps {
  groups: MailGroup[];
  onSelectMail?: (mail: Mail) => void;
}

export function MailList({ groups, onSelectMail }: MailListProps) {
  const { locale, t } = useI18n();
  const [mail, setMail] = useMail();
  const isEmpty = groups.every((group) => group.items.length === 0);

  return (
    <ScrollArea className="**:data-[slot=scroll-area-viewport]:scroll-fade min-h-0 flex-1">
      <div className="flex flex-col gap-1.5 pt-0">
        {isEmpty ? (
          <p className="px-4 py-8 text-center text-muted-foreground text-sm">
            {t("admin.communications.mail.inbox.empty")}
          </p>
        ) : null}
        {groups.map((group) => (
          <section key={group.id} className="flex flex-col gap-1.5">
            <div className="mx-3 text-muted-foreground text-xs">
              {group.title} ({group.items.length})
            </div>

            <div className="flex flex-col">
              {group.items.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={cn(
                    "group relative w-full border-transparent border-y p-3 text-left transition-colors",
                    "hover:bg-muted/60",
                    mail.selected === item.id &&
                      "border-border bg-muted/70 before:absolute before:-inset-y-px before:left-0 before:w-0.5 before:bg-primary",
                  )}
                  onClick={(event) => {
                    event.currentTarget.blur();

                    setMail({
                      ...mail,
                      selected: item.id,
                    });
                    onSelectMail?.(item);
                  }}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="size-9 after:rounded-sm">
                      <AvatarFallback className="rounded-sm bg-background">{item.from.name[0]}</AvatarFallback>
                    </Avatar>

                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div
                            className={cn(
                              "flex items-center gap-2 truncate font-normal text-sm",
                              !item.isRead && "font-medium",
                            )}
                          >
                            {item.from.name} {!item.isRead && <span className="size-2 rounded-full bg-blue-600" />}
                          </div>
                          <div
                            className={cn(
                              "truncate font-medium text-foreground text-xs",
                              item.isRead && "font-normal text-muted-foreground",
                            )}
                          >
                            {item.subject}
                          </div>
                        </div>

                        <div
                          className={cn(
                            "shrink-0 text-muted-foreground text-xs",
                            mail.selected === item.id && "text-foreground",
                          )}
                        >
                          {formatMailDate(item.receivedAt, locale)}
                        </div>
                      </div>

                      <p className="mt-2 line-clamp-2 text-muted-foreground text-xs leading-5">{item.body}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </ScrollArea>
  );
}

function formatMailDate(date: string, locale: Locale) {
  const mailDate = new Date(date);
  const differenceInMilliseconds = mailDate.getTime() - Date.now();
  const absoluteDifference = Math.abs(differenceInMilliseconds);
  const formatter = new Intl.RelativeTimeFormat(getIntlLocale(locale), { numeric: "auto" });

  if (absoluteDifference < 60_000) {
    return formatter.format(Math.round(differenceInMilliseconds / 1000), "second");
  }
  if (absoluteDifference < 3_600_000) {
    return formatter.format(Math.round(differenceInMilliseconds / 60_000), "minute");
  }
  if (absoluteDifference < 86_400_000) {
    return formatter.format(Math.round(differenceInMilliseconds / 3_600_000), "hour");
  }
  if (absoluteDifference < 259_200_000) {
    return formatter.format(Math.round(differenceInMilliseconds / 86_400_000), "day");
  }

  return formatDate(mailDate, locale);
}
