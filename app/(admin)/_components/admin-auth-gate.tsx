"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { Skeleton as BoneyardSkeleton } from "boneyard-js/react";

import { useAuth } from "@/components/auth/auth-provider";
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
          <div className="flex gap-2">
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

function AdminSessionSkeleton() {
  const frame = <AdminSessionLoadingFrame />;

  return (
    <BoneyardSkeleton name="admin-session" loading fallback={frame} fixture={frame}>
      {frame}
    </BoneyardSkeleton>
  );
}

export function AdminAuthGate({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <AdminSessionSkeleton />;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-muted">
              <LockKeyhole className="size-5" />
            </div>
            <CardTitle>Admin sign-in required</CardTitle>
            <CardDescription>
              Sign in with an authorized Vela Wear account before opening the administration workspace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/sign-in" className={cn(buttonVariants(), "w-full")}>
              Go to sign in
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!canAccessManagement(user)) {
    const roleNames = getUserRoleNames(user);

    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-muted">
              <LockKeyhole className="size-5" />
            </div>
            <CardTitle>Management access required</CardTitle>
            <CardDescription>
              This workspace is available to admin, manager, and staff accounts.
              {roleNames.length > 0
                ? ` Your current ${roleNames.length === 1 ? "role is" : "roles are"} ${roleNames.join(", ")}.`
                : " Your account has no assigned management role."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/" className={cn(buttonVariants(), "w-full")}>
              Return to storefront
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return children;
}
