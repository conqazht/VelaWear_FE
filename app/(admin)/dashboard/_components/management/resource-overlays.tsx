"use client";

import type { FormEvent, ReactNode } from "react";
import { Loader2, Trash2 } from "lucide-react";

import { useI18n } from "@/components/providers/i18n-provider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type ResourceFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  children: ReactNode;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isPending?: boolean;
  submitDisabled?: boolean;
  submitLabel?: string;
  contentClassName?: string;
};

export function ResourceFormSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  onSubmit,
  isPending = false,
  submitDisabled = false,
  submitLabel,
  contentClassName,
}: ResourceFormSheetProps) {
  const { t } = useI18n();
  const resolvedSubmitLabel = submitLabel ?? t("admin.shell.form.saveChanges");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className={cn("w-full gap-0 sm:max-w-xl", contentClassName)}>
        <SheetHeader className="border-b pr-12">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={onSubmit}>
          <div className="flex-1 overflow-y-auto p-4">
            <fieldset disabled={isPending} className="min-w-0 space-y-5 border-0 p-0">
              {children}
            </fieldset>
          </div>
          <SheetFooter className="border-t bg-muted/30 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              {t("admin.shell.form.cancel")}
            </Button>
            <Button type="submit" disabled={isPending || submitDisabled}>
              {isPending ? <Loader2 className="animate-spin" /> : null}
              {resolvedSubmitLabel}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

type DeleteResourceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resourceName: string;
  description?: string;
  actionLabel?: string;
  onConfirm: () => void;
  isPending?: boolean;
};

export function DeleteResourceDialog({
  open,
  onOpenChange,
  resourceName,
  description,
  actionLabel,
  onConfirm,
  isPending = false,
}: DeleteResourceDialogProps) {
  const { t } = useI18n();
  const resolvedActionLabel = actionLabel ?? t("admin.shell.delete.action");

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <Trash2 />
          </AlertDialogMedia>
          <AlertDialogTitle>
            {t("admin.shell.delete.title", { action: resolvedActionLabel, resource: resourceName })}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {description ?? t("admin.shell.delete.description")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>{t("admin.shell.form.cancel")}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm} disabled={isPending}>
            {isPending ? <Loader2 className="animate-spin" /> : <Trash2 />}
            {resolvedActionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
