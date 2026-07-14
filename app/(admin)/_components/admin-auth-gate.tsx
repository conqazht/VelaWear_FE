"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Loader2, LockKeyhole } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function AdminAuthGate({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="size-4 animate-spin" /> Checking admin session...
        </div>
      </div>
    );
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

  return children;
}
