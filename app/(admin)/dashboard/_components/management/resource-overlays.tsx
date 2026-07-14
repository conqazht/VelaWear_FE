"use client";

import type { FormEvent, ReactNode } from "react";
import { Loader2, Trash2 } from "lucide-react";

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
  submitLabel = "Save changes",
  contentClassName,
}: ResourceFormSheetProps) {
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
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || submitDisabled}>
              {isPending ? <Loader2 className="animate-spin" /> : null}
              {submitLabel}
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
  actionLabel = "Delete",
  onConfirm,
  isPending = false,
}: DeleteResourceDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <Trash2 />
          </AlertDialogMedia>
          <AlertDialogTitle>{actionLabel} {resourceName}?</AlertDialogTitle>
          <AlertDialogDescription>
            {description ?? "This action cannot be undone and may affect related records."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm} disabled={isPending}>
            {isPending ? <Loader2 className="animate-spin" /> : <Trash2 />}
            {actionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
