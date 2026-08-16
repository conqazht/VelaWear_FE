import React from "react";
import { type ProfileTabId } from "./profile-formatters";

interface ProfileShellProps {
  activeTab?: ProfileTabId;
  children: React.ReactNode;
}

export function ProfileShell({ children }: ProfileShellProps) {
  return (
    <div className="bg-canvas text-ink flex min-h-screen flex-col">
      <main className="flex w-full flex-grow flex-col gap-10 px-6 py-8 md:px-16 md:py-12">
        {children}
      </main>
    </div>
  );
}
