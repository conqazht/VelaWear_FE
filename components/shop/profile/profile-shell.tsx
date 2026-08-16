import React from "react";
import { type ProfileTabId } from "./profile-formatters";

interface ProfileShellProps {
  activeTab?: ProfileTabId;
  children: React.ReactNode;
}

export function ProfileShell({ children }: ProfileShellProps) {
  return (
    <div className="bg-canvas text-ink min-h-screen flex flex-col">
      <main className="flex-grow w-full px-6 md:px-16 py-8 md:py-12 flex flex-col gap-10">
        {children}
      </main>
    </div>
  );
}
