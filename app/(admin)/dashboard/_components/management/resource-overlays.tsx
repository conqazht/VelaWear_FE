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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

/**
 * Centered Modal Dialog for Resource Creation / Editing across Admin.
 * Replaces old right slide-over Sheet with a focused, hardware-accelerated centered modal.
 */
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "border-border/80 flex max-h-[88vh] max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden rounded-xl border p-0 shadow-2xl ring-1 ring-black/5 duration-150 ease-out sm:max-w-xl md:max-w-2xl dark:ring-white/10",
          contentClassName,
        )}
      >
        <DialogHeader className="border-border/60 bg-muted/20 rounded-t-xl border-b px-6 py-4.5 pr-14 text-left">
          <DialogTitle className="text-foreground text-base font-semibold tracking-tight">
            {title}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground mt-0.5 text-xs">
            {description}
          </DialogDescription>
        </DialogHeader>
        <form className="flex min-h-0 flex-1 flex-col overflow-hidden" onSubmit={onSubmit}>
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <fieldset disabled={isPending} className="min-w-0 space-y-5 border-0 p-0">
              {children}
            </fieldset>
          </div>
          <DialogFooter className="border-border/60 bg-muted/20 -mx-0 -mb-0 flex flex-row items-center justify-end gap-2.5 rounded-none rounded-b-xl border-t px-6 py-3.5 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="text-xs font-medium transition-all duration-150 active:scale-[0.98]"
            >
              {t("admin.shell.form.cancel")}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending || submitDisabled}
              className="text-xs font-semibold transition-all duration-150 active:scale-[0.98]"
            >
              {isPending ? <Loader2 className="animate-spin" /> : null}
              {resolvedSubmitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Alias export for clarity
export const ResourceFormDialog = ResourceFormSheet;
export const ResourceFormModal = ResourceFormSheet;

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
