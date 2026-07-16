"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { LockKeyhole } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { useI18n } from "@/components/providers/i18n-provider";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  canAccessManagement,
  getUserRoleNames,
} from "@/lib/auth/roles";
import { cn } from "@/lib/utils";

function AdminSessionLoadingFrame() {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[17rem_1fr]">
      <aside className="hidden border-r bg-sidebar p-4 lg:flex lg:flex-col lg:gap-6">
        <Skeleton className="h-8 w-36" />
        <div className="grid gap-3">
          <Skeleton className="h-4 w-24" />
          {Array.from({ length: 7 }, (_, index) => (
            <Skeleton key={index} className="h-8 w-full" />
          ))}
        </div>
        <Skeleton className="mt-auto h-12 w-full" />
      </aside>
      <main className="min-w-0">
        <header className="flex h-12 items-center justify-between border-b px-4 lg:px-6">
          <Skeleton className="h-7 w-40" />
          <div className="flex items-center gap-2">
            <Skeleton className="size-8 rounded-full" />
            <Skeleton className="size-8" />
            <Skeleton className="size-8" />
          </div>
        </header>
        <div className="p-4 md:p-6">
          <div className="overflow-hidden rounded-xl border bg-card">
            <div className="flex flex-col gap-4 border-b p-6 md:flex-row md:items-center md:justify-between">
              <div className="grid gap-2">
                <Skeleton className="h-6 w-36" />
                <Skeleton className="h-4 w-72 max-w-full" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
            <div className="grid gap-4 p-4">
              {Array.from({ length: 7 }, (_, index) => (
                <div key={index} className="grid grid-cols-4 gap-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export function AdminAuthGate({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { t } = useI18n();

  if (isLoading) {
    return <AdminSessionLoadingFrame />;
  }

  if (!isAuthenticated) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-background p-6">
        <LanguageSwitcher presentation="popover" className="absolute right-5 top-5" />
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-muted">
              <LockKeyhole className="size-5" />
            </div>
            <CardTitle>{t("admin.shell.auth.signInTitle")}</CardTitle>
            <CardDescription>
              {t("admin.shell.auth.signInDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Link href="/sign-in" className={cn(buttonVariants(), "w-full")}>
              {t("admin.shell.auth.signInAction")}
            </Link>
            <Link href="/" className={cn(buttonVariants({ variant: "outline" }), "w-full")}>
              {t("admin.shell.auth.returnStorefront")}
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!canAccessManagement(user)) {
    const roleNames = getUserRoleNames(user);
    const currentRoleDescription =
      roleNames.length > 0
        ? t(roleNames.length === 1 ? "admin.shell.auth.currentRole" : "admin.shell.auth.currentRoles", {
            roles: roleNames.join(", "),
          })
        : t("admin.shell.auth.noRole");

    return (
      <div className="relative flex min-h-screen items-center justify-center bg-background p-6">
        <LanguageSwitcher presentation="popover" className="absolute right-5 top-5" />
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-muted">
              <LockKeyhole className="size-5" />
            </div>
            <CardTitle>{t("admin.shell.auth.accessTitle")}</CardTitle>
            <CardDescription>
              {t("admin.shell.auth.accessDescription")} {currentRoleDescription}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/" className={cn(buttonVariants(), "w-full")}>
              {t("admin.shell.auth.returnStorefront")}
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return children;
}
